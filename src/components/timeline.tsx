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
    gap: 10px;
    flex-direction: column;
    width: 100%;
    margin-top: 20px;
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
    return (
        <Wrapper>
            {tweets.map(tweet => <Tweet key={tweet.id} {...tweet}/>)}
        </Wrapper>
    );
}