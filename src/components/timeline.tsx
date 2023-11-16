import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { useState, useEffect } from "react"
import styled from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";
import { IRoomDocContext } from "../routes/home";

export interface ITweet {
    id: string;
    photo?: string;
    tweet: string;
    userId: string;
    username: string;
    createdAt: number;
}

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 47px 41px;
    width: 100%;
    @media screen and (max-width: 1400px) {
        gap: 30px 10px;
    }
    @media screen and (max-width: 1024px) {
        gap: 15px 0;
    }
`;

const Empty = styled.div`
    width: 100%;
    text-align: center;
    > span{
        display: block;
        font-size: 150px;
    }
    > p{
        font-size: 30px;
        font-weight: 500;
        line-height: 1.3;
        margin-top: 30px;
        img{
            vertical-align: middle;
            width: 180px;
        }
    }
    @media screen and (max-width: 1024px) {
        padding-top: 30px;
        > span{
            font-size: 70px;
        }
        > p{
            font-size: 18px;
            margin-top: 20px;
            img{
                width: 100px;
            }
        }
    }
    @media screen and (max-width: 370px) {
        > p{
            img{
                display: block;
                width: 90%;
                margin: 0 auto 5px;
            }
        }
    }
`;

export default function Timeline({ roomDocId } : IRoomDocContext) {
    const [tweets, setTweet] = useState<ITweet[]>([]);
    useEffect(() => {
        let unsubscribe : Unsubscribe | null = null;
        const fetchTweets = async () => {
            const tweetsQuery = query(
                collection(db, "tweets"),
                where("roomDocId","==",roomDocId),
                orderBy("createdAt", "desc"),
                limit(25)
            );
            /* const spanshot = await getDocs(tweetsQuery);
            const tweets = spanshot.docs.map((doc) => {
                const {tweet, createdAt, userId, username, photo} = doc.data();
                return {
                    tweet, createdAt, userId, username, photo,
                    id: doc.id,
                }
            }); */
            unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
                const tweets = snapshot.docs.map((doc) => {
                    const {tweet, createdAt, userId, username, photo} = doc.data();
                    return {
                        tweet, createdAt, userId, username, photo,
                        id: doc.id,
                    }
                });
                setTweet(tweets);
            });
        }
        fetchTweets();
        return () => {
            unsubscribe && unsubscribe();
        }
    }, [roomDocId]);
    console.log(tweets);
    return (
        <Wrapper>
            {tweets.length === 0 ?
            <Empty>
                <span>🎨</span> 
                <p><img src="/public/btn01.jpg" alt="게시물 작성" /> 버튼을 눌러 <br />
                    게시물을 작성해주세요!
                </p>
            </Empty>
            :
            tweets.map(tweet => <Tweet key={tweet.id} {...tweet}/>)
            }
        </Wrapper>
    );
}