import styled from "styled-components";
import PostTweetForm from "../components/post-tweet-form";
import Timeline from "../components/timeline";

const Wrapper = styled.div`
    display: grid;
    grid-template-rows: 1fr 5fr;
    gap: 50px;
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
    return (
        <Wrapper>
            <PostTweetForm />
            <Timeline />
        </Wrapper>
    );
}