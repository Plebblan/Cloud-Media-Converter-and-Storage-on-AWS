const path = require('path');
const { execSync } = require('child_process');
const cdk = require('aws-cdk-lib');
const s3 = require('aws-cdk-lib/aws-s3');
const cloudfront = require('aws-cdk-lib/aws-cloudfront');
const origins = require('aws-cdk-lib/aws-cloudfront-origins');
const s3deploy = require('aws-cdk-lib/aws-s3-deployment');

class FrontendStack extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const frontendDir = path.join(__dirname, '..', '..', 'frontend');
    const buildEnv = {
      ...process.env,
      VITE_API_URL: props.apiGateway?.url || process.env.VITE_API_URL || '',
    };

    execSync('npm run build', {
      cwd: frontendDir,
      stdio: 'inherit',
    });

    // 1. Private S3 bucket for storing frontend static assets
    const siteBucket = new s3.Bucket(this, 'FrontendBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 2. CloudFront Distribution using Origin Access Control (OAC)
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(siteBucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
      defaultRootObject: 'index.html',
      // SPA Fallback: Redirect 404/403 back to index.html for client-side routing (React / Vue / Svelte)
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5),
        },
      ],
    });

    if (props.apiGateway) {
      distribution.addBehavior('/api/*', new origins.RestApiOrigin(props.apiGateway), {
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      });
    }

    // 3. Automatically build (if needed) & upload files from your local frontend folder to S3
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, '..', '..', 'frontend', 'dist')), // Adjust to your build output path
      ],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'], // Invalidates CloudFront edge cache on new deployments
    });

    // 4. Output CloudFront Domain URL
    new cdk.CfnOutput(this, 'FrontendUrl', {
      value: `https://${distribution.distributionDomainName}`,
      description: 'The public HTTPS URL of your frontend application',
    });
  }
}

module.exports = { FrontendStack };