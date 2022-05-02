// Injected by Vite
const env = import.meta.env

const config = {
    CONTRACT_ADDRESS: env.VITE_CONTRACT_ADDRESS,
    filebase: {
        baseUrl: env.VITE_FILEBASE_BASEURL,
        bucketName: env.VITE_FILEBASE_BUCKET_NAME,
        // Ensure that these keys are restricted properly to the bucket!
        apiKey: env.VITE_FILEBASE_API_KEY,
        apiSecret: env.VITE_FILEBASE_API_SECRET,
    }
}

export default config