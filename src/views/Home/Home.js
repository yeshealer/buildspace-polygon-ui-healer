import React, { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { Flex, Link, Text } from "crox-new-uikit";
import * as LottiePlayer from "@lottiefiles/lottie-player";
import useMediaQuery from 'use-mediaquery'
import { Icon } from '@iconify/react';
import { ethers } from "ethers";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import contractAbi from '../../utils/PolygonDomain.json'
import WalletConnect from "../../components/WalletConnect";
import "../../assets/css/home.scss"

const tld = ".healer"
const CONTRACT_ADDRESS = "0x62591352BF46cdF57Fe84107f0acFcc99D4010F2";

function Home() {
    const ismobile = useMediaQuery("(max-width: 600px)")

    const [domain, setDomain] = useState('')
    const [record, setRecord] = useState('')
    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [mints, setMints] = useState([])
    const { account, chainId } = useWeb3React()
    const DomainLengthWarning = () => toast.warning("Domain must be at least 3 characters long", {
        theme: "colored"
    });
    const Failed = () => toast.error("Transaction failed! Please try again", {
        theme: 'colored'
    })

    const mintDomain = async () => {
        if (!domain) { return }
        if (domain.length < 3) {
            DomainLengthWarning();
            return
        }
        const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
        console.log('Minting domain', domain, "with price", price)
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner();
                const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

                console.log("Going to pop wallet now to pay gas...", contract)
                let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) })
                const receipt = await tx.wait();

                if (receipt.status === 1) {
                    console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);
                    tx = await contract.setRecord(domain, record);
                    await tx.wait();

                    console.log("Record set! https://mumbai.polygonscan.com/tx/" + tx.hash);
                    setTimeout(() => {
                        fetchMints()
                    }, 2000)
                    setRecord('')
                    setDomain('')
                } else {
                    Failed()
                }
            }
        } catch (error) {
            console.log(error)
            Failed()
        }
    }

    const updateDomain = async () => {
        if (!record || !domain) { return }
        setLoading(true);
        console.log("Updating domain", domain, "with record", record);
        try {
            const { ethereum } = window;
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner()
                const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

                let tx = await contract.setRecord(domain, record);
                await tx.wait()
                console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);

                fetchMints()
                setRecord('')
                setDomain('')
            }
        } catch (error) {
            console.log(error)
        }
        setLoading(false)
    }

    const fetchMints = async () => {
        try {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum);
                const signer = provider.getSigner()
                const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer)

                const names = await contract.getAllNames();

                const mintRecords = await Promise.all(names.map(async (name) => {
                    const mintRecord = await contract.records(name)
                    const owner = await contract.domains(name);
                    return {
                        id: names.indexOf(name),
                        name: name,
                        record: mintRecord,
                        owner: owner,
                    }
                }))
                console.log("MINTS FETCHED", mintRecords)
                setMints(mintRecords)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        if (account) {
            fetchMints()
        }
    }, [account, chainId])

    const renderMints = () => {
        if (account && mints.length > 0) {
            return (
                <Flex className="animationCard" flexDirection='column'>
                    <Text fontSize="20px" style={{ alignSelf: 'center' }}> Recently minted domains!</Text>
                    <Flex flexDirection='column'>
                        {mints.map((mint, index) => {
                            return (
                                <Flex key={index} justifyContent='space-between' alignItems='center' className="domainLink">
                                    <Flex flexDirection='column'>
                                        <Link className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
                                            <Text className="underlined" fontSize="18px" bold>{' '}{mint.name}{tld}{' '}</Text>
                                        </Link>
                                        <Text fontSize="15px" color="#c3c3c3"> {mint.record} </Text>
                                    </Flex>
                                    {mint.owner.toLowerCase() === account.toLowerCase() ?
                                        <button className="edit-button" onClick={() => editRecord(mint.name)}>
                                            <Icon icon="akar-icons:edit" color="white" width="40" height="40" />
                                        </button>
                                        :
                                        null
                                    }
                                </Flex>)
                        })}
                    </Flex>
                </Flex>
            );
        }
    };

    const editRecord = (name) => {
        console.log("Editing record for", name)
        setEditing(true)
        setDomain(name)
    }

    const cancelEdit = () => {
        setEditing(false)
        setDomain('')
    }

    return (
        <Flex justifyContent='center'>
            <Flex className="page" justifyContent='center' alignItems='center'>
                {!account ? (
                    <WalletConnect />
                ) : (
                    <Flex flexDirection={ismobile ? "column" : "row"} mt={ismobile && '220px'}>
                        <Flex className="animationCard" flexDirection='column' alignItems='center'>
                            <Text fontSize="30px" bold>Healer Name Service</Text>
                            <Text>Your immortal API on the blockchain!</Text>
                            <lottie-player
                                autoplay
                                loop
                                src="https://assets9.lottiefiles.com/packages/lf20_sg3zxa.json"
                                style={{ width: '250px' }}
                            />
                        </Flex>
                        <Flex className="animationCard" flexDirection='column' alignItems='center'>
                            <Flex alignItems='center' className="input_group">
                                <input type='text' value={domain} disabled={editing} placeholder='domain' className="input" onChange={e => setDomain(e.target.value)} />
                                <Text color="white">{tld}</Text>
                            </Flex>
                            <Flex alignItems='center' className="input_group record_input" mt='10px'>
                                <input
                                    type="text"
                                    value={record}
                                    placeholder='who a u healing?'
                                    onChange={e => setRecord(e.target.value)}
                                />
                            </Flex>
                            <Flex flexDirection='column'>
                                <ToastContainer
                                    position="top-right"
                                    autoClose={5000}
                                    hideProgressBar={false}
                                    newestOnTop={false}
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    draggable
                                    pauseOnHover
                                />
                                {editing ? (
                                    <Flex flexDirection='column'>
                                        <button className="btn-grad" disabled={loading} onClick={updateDomain}>Set record</button>
                                        <button className="btn-grad" onClick={cancelEdit}>Cancel</button>
                                    </Flex>
                                ) : (
                                    <button className='btn-grad' disabled={null} onClick={mintDomain}>
                                        Mint
                                    </button>
                                )}
                            </Flex>
                        </Flex>
                        {mints && renderMints()}
                    </Flex>
                )}
            </Flex>
        </Flex >
    )
}

export default Home