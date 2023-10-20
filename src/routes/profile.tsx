import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    flex-direction: column;
    gap: 20px;
    width: calc(100% - 300px);
`;

const AvatarUpload = styled.label`
    width: 80px;
    overflow: hidden;
    height: 80px;
    border-radius: 50%;
    background-color: #1d9bf0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    svg{
        width: 50px;
    }
`;

const AvatarImg = styled.img`
    width: 100%;
`;

const AvatarInput = styled.input`
    display: none;
`;

const Name = styled.span`
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
    text-align: center;
    font-size: 22px;

`;

const NameButton = styled.button`
    border: 0;
    padding: 0;
    background-color: transparent;
    color: #ffffff;
    cursor: pointer;
    svg{
        width: 22px;
    }
`;

const NameModal = styled.form`
    display: none;
    position: absolute;
    left: 50%;
    top: calc(100% + 10px);
    transform: translateX(-50%);
    padding: 10px;
    align-items: center;
    gap: 5px;
    background-color: #ffffff;
    &.on{
        display: flex;
    }
`;
const NameInput = styled.input`
    width: 100px;
    height: 25px;
`;
const NameSubmit = styled.input`
    width: 50px;
    height: 25px;
    font-size: 15px;
`;

const Tweets = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 10px;
`;

export default function Profile() {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState(user?.photoURL);
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [isOnOff, setOnOff] = useState(false);
    const [newName, setNewName] = useState(user?.displayName);
    const [currName, setCurrName] = useState(user?.displayName);
    const onAvatarChange = async (e : React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatar/${user?.uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL: avatarUrl,
            });
        }
    };
    const fetchTweets = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", user?.uid),
            orderBy("createdAt", "desc"),
            limit(25)
        );
        const snapshot = await getDocs(tweetQuery);
        const tweets = snapshot.docs.map((doc) => {
            const {tweet, createdAt, userId, username, photo} = doc.data();
            return {
                tweet, createdAt, userId, username, photo,
                id: doc.id,
            }
        });
        setTweets(tweets);
    };
    useEffect(() => {
        fetchTweets();
    },[]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewName(e.target.value);
    }
    const onsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;
        try{
            await updateProfile(user, {
                displayName: newName,
            });
            setCurrName(newName);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <Wrapper>
            <AvatarUpload htmlFor="avater">
                {avatar ? 
                <AvatarImg src={avatar} /> 
                : 
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                }
            </AvatarUpload>
            <AvatarInput onChange={onAvatarChange} id="avater" type="file" accept="image/*" />
            <Name>
                {currName ?? "Anonymous"} 
                <NameButton onClick={() => setOnOff(isOnOff => !isOnOff)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                </NameButton>
                <NameModal onSubmit={onsubmit} className={isOnOff ? "on":""}>
                    <NameInput onChange={onChange} name="name" type="text" maxLength={10} required />
                    <NameSubmit onClick={() => setOnOff(false)} type="submit" value="수정" />
                </NameModal>
            </Name>
            <Tweets>
                {tweets.map((tweet) => <Tweet key={tweet.id} {...tweet} />)}
            </Tweets>
        </Wrapper>
    );
}