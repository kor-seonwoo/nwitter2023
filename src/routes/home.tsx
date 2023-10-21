import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";
import { useOutletContext } from "react-router-dom";

export interface IRoomDocContext {
    roomDocId: string;
}

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 50px;
    width: calc(100% - 300px);
    overflow-y: scroll;
    padding-right: 10px;
    &::-webkit-scrollbar{
        width: 6px;
    }
    &::-webkit-scrollbar-thumb{
        background: #1d9bf9; 
    }
    &::-webkit-scrollbar-track{
        background: #000000;
    }
    // 모질라 파이어폭스용 css
    scrollbar-width: thin;
    scrollbar-color: #1d9bf9 #000000;
    // ie용 css
    scrollbar-face-color: #1d9bf9;
    scrollbar-track-color: #000000;
            
`;

export default function Home() {
    const { roomDocId } = useOutletContext() as IRoomDocContext;
    return (
        <Wrapper>
            <PostTweetForm roomDocId={roomDocId} />
            <Timeline roomDocId={roomDocId} />
        </Wrapper>
    );
}