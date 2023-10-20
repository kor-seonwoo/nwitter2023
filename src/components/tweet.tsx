import styled from "styled-components";
import { ITweet } from "./timeline";
import { auth, db, storage } from "../firebase";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, getDownloadURL, getMetadata, ref } from "firebase/storage";
import { useEffect, useState } from "react";


const Wrapper = styled.div`
    padding: 15px 20px;
    border: 1px solid rgba(0,0,0,0.5);
    border-radius: 15px;
`;

const ColumnUser = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    > div{
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;

const Circle = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 45px;
    height: 45px;
    background-color: #1d9bf0;
    border-radius: 50%;
    color: #ffffff;
    overflow: hidden;
    svg{
        width: 30px;
    }
    img{
        width: 100%;
    }
`;

const Username = styled.span`
    font-size: 16px;
    font-weight: 600;
`;

const DeleteButton = styled.button`
    background-color: red;
    color: #ffffff;
    font-weight: 600;
    border: 0;
    font-size: 12px;
    padding-left: 5px 10px;
    text-transform: uppercase;
    border-radius: 5px;
    cursor: pointer;
`;

const ColumnImg = styled.div`
    width: 100%;
    text-align: center;
    margin-top: 30px;
`;

const Photo = styled.img`
    max-width: 100%;
`;

const ColumnTxt = styled.div`
    width: 100%;
    margin-top: 30px;
`;

const Payload = styled.p`
    font-size: 18px;
    font-weight: 300;
    line-height: 1.4;
    b{
        font-weight: 600;
    }
`;

const DateTxt = styled.p`
    font-size: 15px;
    font-weight: 400;
    margin-top: 20px;
`;

export default function Tweet({username, photo, tweet, userId, id, createdAt}:ITweet) {
    const user = auth.currentUser;
    const [avatar, setAvatar] = useState("");
    const avatarRef = ref(storage, `avatar/${userId}`);
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
        } finally{

        }
    };
    const urlDown = async () => {
        try {
            const metadata = await getMetadata(avatarRef);
            if (metadata) {
                const tryUrl = await getDownloadURL(avatarRef);
                setAvatar(tryUrl);
            } else {
                console.log('프로필 이미지가 없습니다.');
            }
        } catch (error) {
            if (error && typeof error === 'object' && 'code' in error && error.code === 'storage/object-not-found') {
                console.log('프로필 이미지가 없습니다.');
            } else {
                console.error(error);
            }
        }
    }
    function dateFormat(date: Date): string {
        let month: number | string = date.getMonth() + 1;
        let day: number | string = date.getDate();
        let hour: number | string = date.getHours();
        let minute: number | string = date.getMinutes();
        let second: number | string = date.getSeconds();
    
        month = month >= 10 ? month : '0' + month;
        day = day >= 10 ? day : '0' + day;
        hour = hour >= 10 ? hour : '0' + hour;
        minute = minute >= 10 ? minute : '0' + minute;
        second = second >= 10 ? second : '0' + second;
    
        return date.getFullYear() + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
    }
    useEffect(() => {
        urlDown();
    }, [userId]);
    return (
        <Wrapper>
            <ColumnUser>
                <div>
                    <Circle>
                        {avatar ? 
                        <img src={avatar} alt="프로필 사진" /> 
                        : 
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        }
                    </Circle>
                    <Username>{username}</Username>
                </div>
                {user?.uid === userId ? <DeleteButton onClick={onDelete}>삭제</DeleteButton> : null}
            </ColumnUser>
            {photo ? <ColumnImg>
                <Photo src={photo}></Photo>
            </ColumnImg> : null}
            <ColumnTxt>
                <Payload><b>{username}</b>&nbsp; {tweet}</Payload>
                <DateTxt>{dateFormat(currentDate)}</DateTxt>
            </ColumnTxt>
        </Wrapper>
    )
}