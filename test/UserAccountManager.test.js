const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserAccountManager", function () {
    let UserAccountManager, userAccountManager;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        UserAccountManager = await ethers.getContractFactory("UserAccountManager");
        userAccountManager = await UserAccountManager.deploy();
        await userAccountManager.getDeployedCode();
    });

    it("Should register a new user", async function () {
        await userAccountManager.connect(owner).registerUser(addr1.address, "user1", "publicKey1", 12345);
        const userPublicKey = await userAccountManager.getUserPublicKey(addr1.address);
        expect(userPublicKey).to.equal("publicKey1");
    });

    it("Should not allow non-owner to register a new user", async function () {
        await expect(
            userAccountManager.connect(addr1).registerUser(addr1.address, "user1", "publicKey1", 12345)
        ).to.be.revertedWith("Not the contract owner");
    });

    it("Should generate an OTP for a registered user", async function () {
        await userAccountManager.connect(owner).registerUser(addr1.address, "user1", "publicKey1", 12345);
        await userAccountManager.connect(addr1).generateOTP(addr1.address);
        const otp = await userAccountManager.getUserOTP(addr1.address);
        const OTp= Number(otp);
        expect(OTp).to.be.a("number");
    });

    it("Should not generate an OTP if not enough time has passed", async function () {
        await userAccountManager.connect(owner).registerUser(addr1.address, "user1", "publicKey1", 12345);
        await userAccountManager.connect(addr1).generateOTP(addr1.address);
        await expect(
            userAccountManager.connect(addr1).generateOTP(addr1.address)
        ).to.be.revertedWith("OTP can only be generated once per minute");
    });

    it("Should authenticate user with correct OTP", async function () {
        await userAccountManager.connect(owner).registerUser(addr1.address, "user1", "publicKey1", 12345);
        await userAccountManager.connect(addr1).generateOTP(addr1.address);
        const otp = await userAccountManager.getUserOTP(addr1.address);
        const isAuthenticated = await userAccountManager.authenticateUser(addr1.address, otp);
        expect(isAuthenticated).to.equal(true);
    });

    it("Should not authenticate user with incorrect OTP", async function () {
        await userAccountManager.connect(owner).registerUser(addr1.address, "user1", "publicKey1", 12345);
        await userAccountManager.connect(addr1).generateOTP(addr1.address);
        const incorrectOtp = 999999; // An incorrect OTP
        await expect(
            userAccountManager.authenticateUser(addr1.address, incorrectOtp)
        ).to.be.revertedWith("Invalid OTP");
    });

    it("Should not authenticate user if OTP has expired", async function () {
        await userAccountManager.connect(owner).registerUser(addr1.address, "user1", "publicKey1", 12345);
        await userAccountManager.connect(addr1).generateOTP(addr1.address);
        const otp = await userAccountManager.getUserOTP(addr1.address);
        // Increase the EVM time by 301 seconds (to simulate OTP expiration)
        await ethers.provider.send("evm_increaseTime", [301]);
        await ethers.provider.send("evm_mine", []);
        await expect(
            userAccountManager.authenticateUser(addr1.address, otp)
        ).to.be.revertedWith("OTP has expired");
    });
});
