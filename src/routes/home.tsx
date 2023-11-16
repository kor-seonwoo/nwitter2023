import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";
import { useOutletContext } from "react-router-dom";

export interface IRoomDocContext {
    roomDocId: string;
    tweetModalOn?: boolean;
}

const Wrapper = styled.div`
    width: calc(100% - 260px);
    height: 100%;
    padding: 40px;
    overflow-y: scroll;
    &::-webkit-scrollbar{
        width: 4px;
    }
    &::-webkit-scrollbar-thumb{
        background: #E2E2E2; 
    }
    &::-webkit-scrollbar-track{
        background: #ffffff;
    }
    // 모질라 파이어폭스용 css
    scrollbar-width: thin;
    scrollbar-color: #E2E2E2 #ffffff;
    // ie용 css
    scrollbar-face-color: #E2E2E2;
    scrollbar-track-color: #ffffff;
    @media screen and (max-width: 1400px) {
        padding: 20px;
    }
    @media screen and (max-width: 1024px) {
        padding: 10px;
    }
    @media screen and (max-width: 560px){
        width: 52%;
    }
`;

export default function Home() {
    const { tweetModalOn, roomDocId } = useOutletContext() as IRoomDocContext;
    return (
        <Wrapper>
            <Timeline roomDocId={roomDocId} />
            {tweetModalOn ? <PostTweetForm roomDocId={roomDocId} /> : null}
        </Wrapper>
    );
}