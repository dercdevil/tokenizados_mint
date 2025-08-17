// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.27;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20Metadata} from "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {Base64} from "@openzeppelin/contracts/utils/Base64.sol";

contract MintBonusNFT is ERC721, Ownable {
    using SafeERC20 for IERC20Metadata;

    IERC20Metadata public rewardToken;
    uint8 public rewardTokenDecimals;

    uint256 private _nextTokenId;
    uint256 public constant BONUS_MAX_ID = 50;

    event RewardPaid(address indexed to, uint256 tokenId, uint256 rewardAmount);
    event RewardTokenUpdated(address indexed newToken, uint8 decimals);

    constructor(
        address initialOwner,
        address rewardToken_
    ) ERC721("Premio Tokenizados", "TKPRIZE") Ownable(initialOwner) {
        _setRewardToken(rewardToken_);
    }

    /**
     * @dev Devuelve la URI con la metadata del NFT.
     * La metadata se genera on-chain y se codifica en Base64.
     */
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        // --- LÍNEA CORREGIDA ---
        // ownerOf revierte si el token no existe, cumpliendo la misma función que _exists.
        ownerOf(tokenId);

        string memory name = string(
            abi.encodePacked("Premio Tokenizados #", Strings.toString(tokenId))
        );
        string memory description = "Premio por mintear en tokenizados.net";
        string
            memory image = "https://tokenizados.net/img/tokenizado-logo.webp";

        // Construimos el JSON
        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        "{",
                        '"name": "',
                        name,
                        '", ',
                        '"description": "',
                        description,
                        '", ',
                        '"image": "',
                        image,
                        '"',
                        "}"
                    )
                )
            )
        );

        // Devolvemos la Data URI
        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    function setRewardToken(address newToken) external onlyOwner {
        _setRewardToken(newToken);
    }

    function _setRewardToken(address newToken) internal {
        require(newToken != address(0), "Invalid reward token");
        rewardToken = IERC20Metadata(newToken);
        rewardTokenDecimals = rewardToken.decimals();
        emit RewardTokenUpdated(newToken, rewardTokenDecimals);
    }

    function rescueRewards(address to, uint256 amount) external onlyOwner {
        rewardToken.safeTransfer(to, amount);
    }

    /// @notice Mint un nuevo NFT. Si el tokenId es múltiplo de 10 y <= 50, paga bonus.
    function safeMint(address to) external returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);

        bool isMultipleOf10 = (tokenId % 10 == 0);
        if (isMultipleOf10 && tokenId > 0 && tokenId <= BONUS_MAX_ID) {
            uint256 rewardUnits = tokenId / 5; // ej: tokenId=10 -> 2 USDC
            uint256 rewardAmount = rewardUnits * (10 ** rewardTokenDecimals);

            uint256 bal = rewardToken.balanceOf(address(this));
            require(bal >= rewardAmount, "Insufficient reward balance");

            rewardToken.safeTransfer(to, rewardAmount);
            emit RewardPaid(to, tokenId, rewardAmount);
        }

        return tokenId;
    }
}
