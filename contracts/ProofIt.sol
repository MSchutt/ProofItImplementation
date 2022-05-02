// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ProofIt {
    mapping(bytes => Ownership[]) private assets;
    mapping(address => bytes[]) private owners;

    struct Ownership {
        address owner;
        uint256 blockTimestamp;
        address[] verifiedFor;
    }

    /**
    * Mints a new token with provided tokenID
    * @param _tokenID IPFS Link of the token
    * Check if the tokenID is not already in use then pushes an Ownership struct
    */
    function mint(bytes memory _tokenID) public {
        // Check that token is not empty
        require(_tokenID.length > 0, "Provided TokenID is empty");

        // Check that the token is not already minted
        require(assets[_tokenID].length == 0, "Asset was already minted");

        _transferOwnership(_tokenID, msg.sender);
    }

    /**
    * @param _tokenID tokenID
    * Checks if the asset exists
    */
    function doesAssetExist(bytes memory _tokenID) public view returns (bool) {
        return assets[_tokenID].length > 0;
    }

    /**
    * @param _tokenID tokenID
    * checks if the asset exists or not
    */
    function checkIfAssetExists(bytes memory _tokenID) private view {
        require(assets[_tokenID].length > 0, "Asset does not exist");
    }

    /**
    * Transfers ownership of an asset to another address
    * @param _to address to send ownership to
    * @param _tokenID asset to send
    */
    function transferOwnership(bytes memory _tokenID, address _to) public {
        checkIfAssetExists(_tokenID);
        require(assets[_tokenID][assets[_tokenID].length - 1].owner == msg.sender, "Cannot transfer assets from other people!");
        _transferOwnership(_tokenID, _to);
    }

    /**
    * Checks if the user is the owner of an asset (no verification required)
    * @param _tokenID asset
    * @param _addr address of user to check
    */
    function isOwnerOfInsecure(bytes memory _tokenID, address _addr) public view returns(bool) {
        checkIfAssetExists(_tokenID);
        return _isOwner(_tokenID, _addr);
    }

    /**
    * Write a secure verification for address
    * @param _tokenID asset
    * @param _for verification for user
    */
    function storeVerification(bytes memory _tokenID, address _for) public {
        checkIfAssetExists(_tokenID);
        // Make sure that user is the current owner
        require(assets[_tokenID][assets[_tokenID].length - 1].owner == msg.sender, "Sender of transaction is not the current owner");
        // Push an additional verification for that address
        assets[_tokenID][assets[_tokenID].length - 1].verifiedFor.push(_for);
    }


    /**
    * Check if user is the owner of the asset (without verification check)
    * @param tokenID token
    * @param _addr address
    */
    function _isOwner(bytes memory tokenID, address _addr) private view returns(bool) {
        return assets[tokenID][assets[tokenID].length - 1].owner == _addr;
    }

    /**
    * Checks if the user is the owner and an verification entry was written for that user
    * @param _tokenID asset
    * @param _addr address of user to check (ownership)
    * @param _for address of user to check verification for (created verification)
    */
    function isOwnerOf(bytes memory _tokenID, address _addr, address _for) public view returns(bool) {
        // Check for existance
        checkIfAssetExists(_tokenID);
        // Check for ownership
        require(_isOwner(_tokenID, _addr), "User is not owner");

        // Additionally check if the user is in the verified list
        Ownership memory o = assets[_tokenID][assets[_tokenID].length - 1];
        for (uint256 i = 0; i < o.verifiedFor.length; i++) {
            if (o.verifiedFor[i] == _for) {
                return true;
            }
        }
        return false;
    }

    /**
    * Transfers ownership (helper)
    * @param tokenID asset
    * @param _to to
    */
    function _transferOwnership(bytes memory tokenID, address _to) private {
        address[] memory verifiedFor;
        assets[tokenID].push(Ownership(_to, block.timestamp, verifiedFor));
        _updateOwnerMap(tokenID, _to);
    }

    /**
    * Updates the owner's mapping
    * @param tokenID asset
    */
    function _updateOwnerMap(bytes memory tokenID, address _to) private {
        address previousOwner = msg.sender;
        bool ok;
        bool found = false;
        // Check if the user has any assets
        // Delete the entry for the previous owner
        if (owners[previousOwner].length > 0) {
            uint256 foundIdx;
            // iterate over all owned assets from owner
            for (uint256 i = 0; i < owners[previousOwner].length; i++) {
                // Only if it's the same length compare byte per byte
                if (owners[previousOwner][i].length == tokenID.length) {
                    ok = true;
                    for (uint256 j = 0; j < owners[previousOwner][i].length; j++) {
                        if (owners[previousOwner][i][j] != tokenID[j]) {
                            ok = false;
                        }
                    }
                    if (ok) {
                        foundIdx = i;
                        found = true;
                        break;
                    }
                }

            }
            if (found) {
                // Copy latest position to foundIdx
                owners[previousOwner][foundIdx] = owners[previousOwner][owners[previousOwner].length - 1];
                // Remove latest entry
                owners[previousOwner].pop();
            }
        }
        // Append to current owner
        owners[_to].push(tokenID);
    }

    /**
    * Returns all Ownership structs for that token
    * @param _tokenID asset
    */
    function getPreviousOwners(bytes memory _tokenID) public view returns (Ownership[] memory) {
        checkIfAssetExists(_tokenID);
        return assets[_tokenID];
    }

    /**
    * Returns the current owner of that asset
    * @param _tokenID asset
    */
    function getCurrentOwner(bytes memory _tokenID) public view returns (Ownership memory) {
        checkIfAssetExists(_tokenID);
        return assets[_tokenID][assets[_tokenID].length - 1];
    }

    /**
    * Returns currently owned assets
    * @param _usr address
    */
    function getOwnedAssets(address _usr) public view returns (bytes[] memory) {
        return owners[_usr];
    }
}