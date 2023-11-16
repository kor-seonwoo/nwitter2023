import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const Wrapper = styled.div`
    width: calc(100% / 3 - 28px);
    padding: 20px;
    border: 1px solid #C2C2C2;
    @media screen and (max-width: 1400px) {
        width: calc(100% / 3 - 7px);
    }
    @media screen and (max-width: 1200px) {
        width: calc(50% - 5px);
    }
    @media screen and (max-width: 1024px) {
        width: 100%;
    }
    @media screen and (max-width: 560px) {
        padding: 10px;
    }
`;

const ColumnUser = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 10px;
    cursor: pointer;
    > div{
        display: flex;
        align-items: center;
    }
    @media screen and (max-width: 560px) {
        gap: 3px;
    }
`;

const Circle = styled.span`
    display: flex;
    align-items: flex-end;
    justify-content: center;
    width: 38px;
    height: 38px;
    background-color: #E2E2E2;
    border: 1px solid #E2E2E2;
    border-radius: 50%;
    overflow: hidden;
    > img{
        width: 100%;
    }
    > svg{
        height: 36px;
        margin-bottom: -5px;
        color: #AAAAAA;
    }
    @media screen and (max-width: 560px) {
        width: 30px;
        height: 30px;
        > svg{
            height: 30px;
        }
    }
`;

const Username = styled.span`
    font-size: 20px;
    font-weight: 600;
    margin-left: 18px;
    @media screen and (max-width: 560px) {
        font-size: 15px;
        margin-left: 5px;
    }
`;

const DateTxt = styled.p`
    font-size: 12px;
    font-weight: 400;
    margin: 6px 0 0 13px;
    color: #AAAAAA;
    @media screen and (max-width: 560px) {
        display: none;
    }
`;

const ColumnMenu = styled.nav`
    position: relative;
    cursor: pointer;
    > svg{
        width: 24px;
        &:hover{
            opacity: .8;
        }
    }
`;

const DeleteButton = styled.button`
    position: absolute;
    top: 85%;
    right: 0;
    padding: 2px 10px;
    background-color: #E2E2E2;
    border: 0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    &:hover{
        background-color: red;
        color: #ffffff;
    }
`;

const ColumnImg = styled.div`
    width: 100%;
    height: 459px;
    text-align: center;
    margin-top: 10px;
    overflow-y: auto;
    &::-webkit-scrollbar{
        width: 3px;
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
    @media screen and (max-width: 560px) {
        height: auto;
    }
`;

const Photo = styled.img`
    max-width: 100%;
`;

const ColumnTxt = styled.div`
    width: 100%;
    margin-top: 10px;
    p{
        font-size: 20px;
        font-weight: 300;
        line-height: 1.4;
    }
    @media screen and (max-width: 560px) {
        p{
            font-size: 15px;
        }
    }
`;

const DateTxt2 = styled.p`
    display: none;
    @media screen and (max-width: 560px) {
        display: block;
        font-size: 12px;
        font-weight: 400;
        margin-top: 10px;
        color: #AAAAAA;
    }
`;

export default function Tweet({ username, photo, tweet, userId, id, createdAt}:ITweet) {
    const navigate = useNavigate();
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState("");
    const [name, setName] = useState(username);
    const [delBtn, setDelBtn] = useState(false);
    const docRefUserList = doc(db, 'userList', userId);
    const currentDate = new Date(createdAt);
    const onDelete = async () => {
        const ok = confirm("게시물을 삭제하시겠습니까?");
        if (!ok || user?.uid !== userId) return;
        try{
            await deleteDoc(doc(db, "tweets", id));
            if (photo) {
                const photoRef = ref(storage, `tweets/${user.uid}/${id}`);
                await deleteObject(photoRef);
            }
        } catch (e){
            console.log(e);
        }
    };
    const urlDown = () => {
        const unsub = onSnapshot(docRefUserList, (doc) => {
            if (doc.exists()) {
                const { hasProfileImage } = doc.data();
                setAvatar(hasProfileImage);
            }
        });
        return unsub;
    }
    const fetchUser = () => {
        const unsub = onSnapshot(docRefUserList, (doc) => {
            if (doc.exists()) {
                const { name } = doc.data();
                setName(name);
            } else {
                setName(username);
            }
        });
        return unsub;
    };
    function dateFormat(date: Date): string {
        let month: number | string = date.getMonth() + 1;
        let day: number | string = date.getDate();
        // let hour: number | string = date.getHours();
        // let minute: number | string = date.getMinutes();
        // let second: number | string = date.getSeconds();
    
        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;
        // hour = hour >= 10 ? hour : '0' + hour;
        // minute = minute >= 10 ? minute : '0' + minute;
        // second = second >= 10 ? second : '0' + second;
    
        // return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
        return date.getFullYear() + '.' + month + '.' + day;
    }
    const goToProfile = () => {
        navigate(`/profile/${userId}`);
    };
    useEffect(() => {
        const unsubFetchUser = fetchUser();
        const unsubUrlDown = urlDown();
    
        return () => {
            unsubFetchUser();
            unsubUrlDown();
        };
    }, [userId]);
    return (
        <Wrapper>
            <ColumnUser>
                <div onClick={goToProfile}>
                    <Circle>
                        {avatar ? 
                        <img src={avatar} alt="프로필 사진" /> 
                        : 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                        </svg>
                        }
                    </Circle>
                    <Username>{name}</Username>
                    <DateTxt>{dateFormat(currentDate)}</DateTxt>
                </div>
                {user?.uid === userId ? 
                <ColumnMenu onClick={() => setDelBtn(!delBtn)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    {delBtn ? <DeleteButton onClick={onDelete}>삭제</DeleteButton> : null}
                </ColumnMenu>
                :
                null
                }
            </ColumnUser>
            {photo ? <ColumnImg>
                <Photo src={photo}></Photo>
            </ColumnImg> : null}
            <ColumnTxt>
                <p>{tweet}</p>
            </ColumnTxt>
            <DateTxt2>{dateFormat(currentDate)}</DateTxt2>
        </Wrapper>
    )
}