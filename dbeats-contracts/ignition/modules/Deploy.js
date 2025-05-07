const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

module.exports = buildModule('MainModule', (m) => {
    // Deploy PlatformWallet
    const owners = [
        '0x1ABc133C222a185fEde2664388F08ca12C208F76',
        '0x143C4BEEf05eeB3eFb9062A96Af96C0564d3FBd4',
    ]
    const requiredConfirmations = 2
    const platformWallet = m.contract('DBeatsPlatformWallet', [
        owners,
        requiredConfirmations,
    ])

    // Deploy FeeManager
    const initialFeePercentage = 10
    const feeManager = m.contract('FeeManager', [initialFeePercentage])

    // Deploy Platform
    const platform = m.contract('Platform', [platformWallet])

    // Deploy Factory
    const factory = m.contract('DBeatsFactory', [platformWallet, feeManager])

    return { platformWallet, feeManager, platform, factory }
})
