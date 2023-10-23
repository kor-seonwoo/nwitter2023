import { Link, Outlet, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { auth } from "../firebase";
import RoomMakeForm from "./room-make-form";
import { useState, useMemo } from "react";
import RoomList from "./room-list";

const Wrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    padding: 50px 0;
    width: 100%;
`;

const Menu = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 150px;
    gap: 20px;
`;

const MenuItem = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #1d9bf9;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    svg{
        width: 30px;
        fill: #1d9bf9;
    }
    &.log-out{
        border-color: tomato;
        svg{
            fill: tomato;
        }
    }
`;

const Room = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 150px;
    height: 100%;
    overflow-y: auto;
`;

const OpenBtn = styled.button`
    width: 100%;
`;

export default function Layout() {
    const user = auth.currentUser;
    const [roomModalOn , setRoomMoadlOn] = useState(false);
    const [roomDocId , setRoomDocId] = useState<string>("openTweet");
    const navigate = useNavigate();
    const profileLink = useMemo(() => `/profile/${user?.uid}`, [user?.uid]);
    const onLogOut = async () => {
        const ok = confirm("로그아웃을 하시겠습니까?");
        if(ok){
            await auth.signOut();
            navigate("/login");
        }
    }
    return (
        <Wrapper>
            <Menu>
                <Link to="/">
                    <MenuItem>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
                        </svg>
                    </MenuItem>
                </Link>
                <Link to={profileLink}>
                    <MenuItem>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                        </svg>
                    </MenuItem>
                </Link>
                <MenuItem onClick={onLogOut} className="log-out">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M19 10a.75.75 0 00-.75-.75H8.704l1.048-.943a.75.75 0 10-1.004-1.114l-2.5 2.25a.75.75 0 000 1.114l2.5 2.25a.75.75 0 101.004-1.114l-1.048-.943h9.546A.75.75 0 0019 10z" clipRule="evenodd" />
                    </svg>
                </MenuItem>
            </Menu>
            <Room>
                <RoomList setRoomDocId={setRoomDocId} />
                <OpenBtn onClick={() => setRoomMoadlOn(true)}>+</OpenBtn>
                {roomModalOn ? <RoomMakeForm modalDelete={setRoomMoadlOn} /> : null}
            </Room>
            <Outlet context={{ roomDocId }} />
        </Wrapper>
    );
}