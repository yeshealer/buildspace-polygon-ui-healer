import React from "react";
import * as LottiePlayer from "@lottiefiles/lottie-player";
import { Flex, Text } from "crox-new-uikit";

const WalletConnect = () => {

    return (
        <Flex flexDirection='column' alignItems='center' className="animationCard">
            <Text fontSize="24px" mb={10} color="#e2e2e2" bold>👋 Connect Your Wallet!</Text>
            <Text color="#e2e2e2">(Connect with Rinkyby Network)</Text>
            <lottie-player
                autoplay
                loop
                mode="normal"
                src="https://assets10.lottiefiles.com/packages/lf20_gftlvsbm.json"
                style={{ width: '200px' }}
            />
            <Text color="#e2e2e2" mt={10}>Very interesting things await you.</Text>
        </Flex>
    )

}

export default WalletConnect