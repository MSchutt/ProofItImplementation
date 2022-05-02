import {defineStore} from "pinia";
import * as AWS from "aws-sdk";

import config from "../plugins/config";
import Hash from 'ipfs-only-hash'
import {ethers} from "ethers";


// Uses Filestore (S3 compatible API) to upload files
export const useFilestoreStore = defineStore('filestore', {
    state: () => {
        return {
            _s3: new AWS.S3({
                endpoint: config.filebase.baseUrl,
                signatureVersion: 'v4',
                region: 'us-east-1',
                secretAccessKey: config.filebase.apiSecret,
                accessKeyId: config.filebase.apiKey
            })
        }
    },
    getters: {
        s3: state => state._s3
    },
    actions: {
        async putAsset(asset, ethereum) {
            const s3 = this._s3
            // make sure that the hash matches the hash of the file -> first check if the asset exists
            const Key = await Hash.of(JSON.stringify(asset), { cidVersion: 1, rawLeaves: true })
            const encodedAsset = ethers.utils.toUtf8Bytes(Key)
            // Asset was already minted -> error
            const exists = await ethereum.contract.doesAssetExist(encodedAsset)
            if (exists) {
                return { exists: true }
            }
            // Upload asset and return a Promise
            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: config.filebase.bucketName,
                    Key,
                    Body: JSON.stringify(asset),
                    ContentType: 'application/json'
                };
                const o = s3.putObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        // This should not happened (httpHeaders should always trigger first)
                        resolve(null)
                    }
                });
                o.on('httpHeaders', (statusCode, headers) => {
                    resolve({ exists: false, ipfsHash: headers['x-amz-meta-cid'], encodedIpfsHash: encodedAsset })
                });
            });
        },
        async getAsset(assetID) {
            const s3 = this._s3
            return new Promise((resolve, reject) => {
                const params = {
                    Bucket: config.filebase.bucketName,
                    Key: assetID
                };
                s3.getObject(params, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        }
    }
})