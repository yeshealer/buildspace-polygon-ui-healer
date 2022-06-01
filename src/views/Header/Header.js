import React, { useEffect } from "react";
import { Flex, Text } from 'crox-new-uikit'
import { useWeb3React } from "@web3-react/core";
import { HiOutlineExternalLink } from 'react-icons/hi'
import { injected } from "./connector";
import "../../assets/css/header.scss"

let isConfirm = false

const Header = () => {
    const { account, activate, deactivate, error, active, chainId } = useWeb3React();
    const handleLogin = () => {
        isConfirm = true;
        localStorage.setItem("accountStatus", "1");
        return activate(injected);
    }

    const handleLogout = () => {
        isConfirm = false
        localStorage.removeItem("accountStatus")
        deactivate()
    }

    function copyToClipBoard() {
        var x = document.getElementById("snackbar");
        x.className = "show";
        setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
    }
    useEffect(() => {
        if (!chainId && isConfirm) {
            const { ethereum } = window;
            (async () => {
                try {
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x13881" }],
                    });
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        try {
                            await ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [
                                    {
                                        chainId: "0x13881",
                                        chainName: "Mumbai",
                                        nativeCurrency: {
                                            name: "MATIC",
                                            symbol: "MATIC",
                                            decimals: 18,
                                        },
                                        rpcUrls: ["https://rpc-mumbai.matic.today"],
                                        blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
                                    },
                                ],
                            });
                        } catch (addError) {
                            console.error(addError);
                        }
                    }
                }
                activate(injected);
            })();
            isConfirm = false;
        }
    }, [account, error, activate, chainId]);

    useEffect(() => {
        if (!active && localStorage.getItem("accountStatus")) {
            activate(injected);
        }
    }, [activate, active])

    return (
        <Flex justifyContent='flex-end'>
            {!account ? (
                <button className="polygon_btn" onClick={handleLogin}>Connect</button>
            ) : (
                <Flex>
                    <button className="account_btn" onClick={() => {
                        navigator.clipboard.writeText(account)
                        copyToClipBoard()
                    }}><Text color="white" bold>{account.slice(0, 5)}...{account.slice(-5)}</Text></button>
                    <button className="account_btn" onClick={handleLogout}><HiOutlineExternalLink fontSize={21} /></button>
                    <Text id="snackbar">Copied</Text>
                </Flex>
            )}
        </Flex>
    )
}

export default Header