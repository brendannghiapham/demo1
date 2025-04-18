name: Deploy Frontend to S3 & CloudFront

on:
push:
branches: - main # Change this to your deployment branch

jobs:
deploy:
runs-on: ubuntu-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install Dependencies
        working-directory: front-end
        run: npm install

      - name: Build React App
        working-directory: front-end
        run: npm run build

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1  # Change to your AWS region

      - name: Deploy to S3
        run: aws s3 sync front-end/build/ s3://s3-bucketkeuy --delete

      - name: Invalidate CloudFront Cache
        run: aws cloudfront create-invalidation --distribution-id E3V5KPKXQWPNKXxxx --paths "/*"
