import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth, db } from "../firebase";
import RoomMakeForm from "./room-make-form";
import { useState, useMemo, useEffect } from "react";
import RoomList from "./room-list";
import { doc, getDoc } from "firebase/firestore";

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    width: 100%;
    height: 100%;
`;

const Menu = styled.div`
    width: 260px;
    height: 100%;
    padding: 20px;
    border-right: 1px solid #C2C2C2;
    @media screen and (max-width: 560px){
        width: 48%;
        padding: 10px;
    }
`;

const Nav = styled.nav`
    position: relative;
    width: 100%;
    padding-bottom: 24px;
    &::before{
        content: '';
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        width: calc(100% + 40px);
        height: 1px;
        background-color: #C2C2C2;
    }
    @media screen and (max-width: 560px){
        padding-bottom: 20px;
        &::before{
            width: calc(100% + 20px);
        }
        > h1{
            width: 80px;
            img{
                width: 100%;
            }
        }
    }
`;

const CurrentUserBox = styled.div`
    display: flex;
    align-items: center;
    gap: 18px;
    width: 100%;
    margin: 45px 0 16px; 
    .icon{
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
    }
    .name{
        font-size: 20px;
        font-weight: 600;
    }
    @media screen and (max-width: 560px){
        margin: 18px 0 10px;
        .icon{
            width: 30px;
            height: 30px;
            > svg{
                height: 30px;
            }
        }
        .name{
            font-size: 17px;
        }
    }
`;

const MenuItem = styled.div`
    width: 100%;
    padding: 10px;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    color: #515151;
    cursor: pointer;
    &:hover{
        background-color: #E2E2E2;
    }
`;

const Room = styled.div`
    width: 100%;
    padding: 24px 0 90px;
`;

interface OpenBtnProps {
    bgcolor: string;
    fontcolor: string;
    bordercolor? :string;
}

const OpenBtn = styled.button<OpenBtnProps>`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 39px;
    padding: 0 10px;
    border: 1px solid ${(props) => props.bordercolor ? props.bordercolor : props.bgcolor};
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    text-align: left;
    background-color: ${(props) => props.bgcolor};
    color: ${(props) => props.fontcolor};
    cursor: pointer;
    margin-bottom: 10px;
    &:hover{
        opacity: .8;
    }
    > span{
        font-size: 22px;
    }
    @media screen and (max-width: 560px){
        height: 34px;
        font-size: 14px;
        > span{
            font-size: 18px;
        }
    }
`;

export default function Layout() {
    const user = auth.currentUser;
    const docRefUserList = doc(db, 'userList', user?.uid as string);
    const [roomModalOn , setRoomMoadlOn] = useState(false);
    const [tweetModalOn , setTweetMoadlOn] = useState(false);
    const [roomDocId , setRoomDocId] = useState<string>("openTweet");
    const [avatar, setAvatar] = useState("");
    const navigate = useNavigate();
    const profileLink = useMemo(() => `/profile/${user?.uid}`, [user?.uid]);
    const onLogOut = async () => {
        const ok = confirm("로그아웃을 하시겠습니까?");
        if(ok){
            await auth.signOut();
            navigate("/login");
        }
    }
    const fetchUser = async () => {
        const docSnapshot = await getDoc(docRefUserList);
        if (docSnapshot.exists()) {
            const { hasProfileImage } = docSnapshot.data();
            setAvatar(hasProfileImage);
        } else {
            console.log("회원이 없습니다.");
        }
    };
    useEffect(() => {
        fetchUser();
    });
    return (
        <Wrapper>
            <Menu>
                <Nav>
                    <h1>
                        <Link to="/" onClick={() => setRoomDocId("openTweet")}>
                            <img src={import.meta.env.VITE_PUBLIC_URL + "/logo.png"} alt="무엇이든 적어보살" />
                        </Link>
                    </h1>
                    <CurrentUserBox>
                        <span className="icon">
                            {avatar ?
                            <img src={avatar} alt="프로필 사진" />
                            :
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                            </svg>
                            }
                        </span>
                        <p className="name">{user?.displayName}</p>
                    </CurrentUserBox>
                    <Link to={profileLink}><MenuItem>프로필</MenuItem></Link>
                    <MenuItem onClick={onLogOut} className="log-out">로그아웃</MenuItem>
                </Nav>
                <Room>
                    <OpenBtn onClick={() => setTweetMoadlOn(!tweetModalOn)} bgcolor="#1D9BF9" fontcolor="#ffffff">게시물 작성 <span>+</span></OpenBtn>
                    <OpenBtn onClick={() => setRoomMoadlOn(true)} bgcolor="#ffffff" fontcolor="#1D9BF9" bordercolor="#1D9BF9">그룹 만들기 <span>+</span></OpenBtn>
                    <OpenBtn onClick={() => setRoomDocId("openTweet")} bgcolor="#E2E2E2" fontcolor="#1D1D1F">홈</OpenBtn>
                    <RoomList setRoomDocId={setRoomDocId} />
                    {roomModalOn ? <RoomMakeForm modalDelete={setRoomMoadlOn} /> : null}
                </Room>
            </Menu>
            <Outlet context={{ tweetModalOn, roomDocId }} />
        </Wrapper>
    );
}