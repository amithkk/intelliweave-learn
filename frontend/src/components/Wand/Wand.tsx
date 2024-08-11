import {Controls, DotLottiePlayer} from "@dotlottie/react-player";
import wandUri from './wand.lottie'
import {Box} from "@mantine/core";

export function Wand() {
    return (
        <Box h={"15em"}>
            <DotLottiePlayer
                src={wandUri}
                autoplay
                loop
            >
            </DotLottiePlayer>
        </Box>
    );
}