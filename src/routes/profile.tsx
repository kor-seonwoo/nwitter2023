import styled from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, doc, getDoc, getDocs, limit, orderBy, query, updateDoc, where } from "firebase/firestore";
import { ITweet } from "../components/timeline";
import Tweet from "../components/tweet";
import { useParams } from "react-router-dom";
import { IRoom } from "../components/room-list";

const Wrapper = styled.div`
    width: calc(100% - 260px);
    height: 100%;
    padding: 40px;
    > .inner{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        height: 210px;
        padding-bottom: 40px;
    }
    @media screen and (max-width: 1400px) {
        padding: 30px 20px;
    }
    @media screen and (max-width: 1024px) {
        padding: 20px 5px;
    }
    @media screen and (max-width: 560px){
        width: 52%;
    }
`;

const AvatarUpload = styled.label`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: #E2E2E2;
    border: 1px solid #E2E2E2;
    cursor: pointer;
    overflow: hidden;
    svg{
        width: 65px;
        margin-bottom: -20px;
        color: #AAAAAA;
    }
    @media screen and (max-width: 560px){
        width: 55px;
        height: 55px;
        svg{
            width: 45px;
            margin-bottom: -15px;
        }
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
    gap: 10px;
    width: 100%;
    text-align: center;
    font-size: 22px;
    @media screen and (max-width: 560px){
        font-size: 17px;
    }
`;

const NameButton = styled.button`
    border: 0;
    padding: 0;
    background-color: transparent;
    cursor: pointer;
    svg{
        width: 22px;
    }
    @media screen and (max-width: 560px){
        svg{
            width: 17px;
        }
    }
`;

const NameModal = styled.form`
    display: none;
    position: absolute;
    left: 50%;
    top: calc(100% + 10px);
    z-index: 5;
    transform: translateX(-50%);
    padding: 10px;
    align-items: center;
    gap: 5px;
    background-color: #ffffff;
    border: 1px solid #7D7D7D;
    &.on{
        display: flex;
    }
    @media screen and (max-width: 560px){
        padding: 5px;
    }
`;

const NameInput = styled.input`
    width: 100px;
    height: 25px;
    border: 1px solid #7D7D7D;
`;

const NameSubmit = styled.input`
    width: 50px;
    height: 25px;
    background-color: #E2E2E2;
    border: 1px solid #7D7D7D;
    font-size: 15px;
    cursor: pointer;
    &:hover{
        opacity: .8;
    }
`;

const GropList = styled.div`
    text-align: center;
    > h2{
        font-size: 18px;
        font-weight: 600;
        color: #7D7D7D;
        margin-bottom: 10px;
    }
    p{
        font-size: 16px;
        font-weight: 500;
        b{
            font-weight: 600;
        }
    }
`;

const TweetsScroll = styled.div`
    width: 100%;
    height: calc(100% - 210px);
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
`;

const Tweets = styled.div`
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

export default function Profile() {
    const params = useParams();
    const uid = params.uid as string;
    const user = auth.currentUser;
    const docRefUserList = doc(db, 'userList', uid);
    const [avatar, setAvatar] = useState("");
    const [tweets, setTweets] = useState<ITweet[]>([]);
    const [isOnOff, setOnOff] = useState(false);
    const [newName, setNewName] = useState("");
    const [currName, setCurrName] = useState("");
    const [groups, setGroups] = useState<IRoom[]>([]);
    const onAvatarChange = async (e : React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e.target;
        if (!user) return;
        if (files && files.length === 1) {
            const file = files[0];
            const locationRef = ref(storage, `avatar/${uid}`);
            const result = await uploadBytes(locationRef, file);
            const avatarUrl = await getDownloadURL(result.ref);
            setAvatar(avatarUrl);
            await updateProfile(user, {
                photoURL: avatarUrl,
            });
            await updateDoc(docRefUserList, {
                hasProfileImage: avatarUrl,
            });
        }
    };
    const fetchUser = async () => {
        const docSnapshot = await getDoc(docRefUserList);
        if (docSnapshot.exists()) {
            const { hasProfileImage, name } = docSnapshot.data();
            setCurrName(name);
            setAvatar(hasProfileImage);
        } else { // 소셜회원
            setCurrName(user?.displayName as string);
            setAvatar(user?.photoURL as string);
        }
    };
    const fetchGroups = async () => {
        try {
            const groupQuery = query(
                collection(db, "rooms"),
                where("userListId", "array-contains", uid),
            );
            const snapshot = await getDocs(groupQuery);
            const groupsData: IRoom[] = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as IRoom));
            setGroups(groupsData);
        } catch (e) {
            console.log(e);
        }
    };
    const fetchTweets = async () => {
        const tweetQuery = query(
            collection(db, "tweets"),
            where("userId", "==", uid),
            where("roomDocId", "==", "openTweet"),
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
        fetchUser();
        fetchGroups();
        fetchTweets();
    },[uid]);

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
            await updateDoc(docRefUserList, {
                name: newName,
            });
            setCurrName(newName);
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <Wrapper>
            <div className="inner">
                <AvatarUpload htmlFor="avater">
                    {avatar ? 
                    <AvatarImg src={avatar} /> 
                    : 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                    }
                </AvatarUpload>
                {user?.uid === uid ? <AvatarInput onChange={onAvatarChange} id="avater" type="file" accept="image/*" /> : null}
                <Name>
                    {currName} 
                    {user?.uid === uid ?
                    <>
                        <NameButton onClick={() => setOnOff(isOnOff => !isOnOff)}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </NameButton>
                        <NameModal onSubmit={onsubmit} className={isOnOff ? "on":""}>
                            <NameInput onChange={onChange} name="name" type="text" maxLength={6} required />
                            <NameSubmit onClick={() => setOnOff(false)} type="submit" value="수정" />
                        </NameModal>
                    </>
                    :
                    null
                    }
                </Name>
                <GropList>
                    <h2>가입된 그룹</h2>
                    {groups.length === 0 ? (
                    <p>가입중인 그룹이 없습니다.</p>
                    ) : groups.length === 1 ? (
                    <p>{<b>{groups[0].roomname}</b>} 그룹 가입중</p>
                    ) : (
                    <p>{<b>{groups[0].roomname}</b>}{`그룹 외 ${groups.length - 1}개의 그룹 가입중`}</p>
                    )}
                </GropList>
            </div>
            <TweetsScroll>
                <Tweets>
                    {tweets.map((tweet) => <Tweet key={tweet.id} {...tweet} />)}
                </Tweets>
            </TweetsScroll>
        </Wrapper>
    );
}