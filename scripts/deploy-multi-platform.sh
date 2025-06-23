#!/bin/bash

PLATFORM=${1:-"vercel"}

echo "🚀 Deploying Scout Analytics to $PLATFORM..."

case $PLATFORM in
  "vercel")
    echo "📦 Deploying to Vercel..."
    
    # Install Vercel CLI if not present
    if ! command -v vercel &> /dev/null; then
        npm install -g vercel
    fi
    
    # Build and deploy
    npm run build
    vercel --prod --confirm
    
    echo "✅ Vercel deployment complete!"
    echo "🔗 Check: https://scout-analytics.vercel.app"
    ;;
    
  "netlify")
    echo "📦 Deploying to Netlify..."
    
    # Install Netlify CLI if not present
    if ! command -v netlify &> /dev/null; then
        npm install -g netlify-cli
    fi
    
    # Build and deploy
    npm run build
    netlify deploy --prod --dir=dist
    
    echo "✅ Netlify deployment complete!"
    ;;
    
  "azure-swa")
    echo "📦 Deploying to Azure Static Web Apps..."
    
    # Install Azure CLI if not present
    if ! command -v az &> /dev/null; then
        echo "❌ Azure CLI required. Install from: https://docs.microsoft.com/en-us/cli/azure/"
        exit 1
    fi
    
    # Build and deploy
    npm run build
    az staticwebapp create \
      --name scout-analytics-swa \
      --resource-group scout-analytics-rg \
      --source ./dist \
      --location "East US 2"
    
    echo "✅ Azure Static Web Apps deployment complete!"
    ;;
    
  "azure-app-service")
    echo "📦 Deploying to Azure App Service (existing workflow)..."
    
    # Use existing Azure App Service deployment
    git push origin main
    
    echo "✅ Triggered Azure App Service deployment via GitHub Actions!"
    ;;
    
  *)
    echo "❌ Unknown platform: $PLATFORM"
    echo "Usage: $0 [vercel|netlify|azure-swa|azure-app-service]"
    exit 1
    ;;
esac