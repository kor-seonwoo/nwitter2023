import styled from "styled-components";
import { auth, db } from "../firebase";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, increment, limit, onSnapshot, orderBy, query, updateDoc} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Unsubscribe } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export interface IRoom {
    id: string;
    roomname: string;
    userListId: Array<string>;
    ownerusername: string;
    isMember?: boolean;
    isOwner?: boolean;
}

export interface IRoomMember {
    userListId: Array<string>;
}

interface RoomDocIdFormProps {
    setRoomDocId: React.Dispatch<React.SetStateAction<string>>;
}

const Wrapper = styled.div`
    width: 100%;
    height: 470px;
    padding-bottom: 30px;
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
    @media screen and (max-width: 560px){
        height: 332px;
    }
`;

const RoomUl = styled.ul`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const RoomLi = styled.li`
    width: 100%;
    padding: 10px;
    .inforBox1{
        font-size: 16px;
        font-weight: 500;
        color: #515151;
    }
    hr{
        width: 100%;
        height: 0;
        border-top: 1px solid #7D7D7D;
        margin: 10px 0;
    }
    .inforBox2{
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        font-weight: 400;
        color: #515151;
    }
    @media screen and (max-width: 560px){
        padding: 10px 5px;
        .inforBox1{
            font-size: 14px;
        }
    }
`;

const RoomBtn = styled.div`
    width: 100%;
    margin-top: 10px;
    .inner{
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
`;

const RoomBtn1 = styled.input`
    width: 100%;
    padding: 6px;
    border: 1px solid #1D9BF9;
    background-color: transparent;
    border-radius: 2px;
    font-size: 12px;
    font-size: 400;
    color: #1D9BF9;
    cursor: pointer;
    &:hover{
        opacity: .8;
        background-color: #1D9BF9;
        color: #ffffff;
    }
`;

interface RoomBtn2Props {
    bgcolor?: string;
    bordercolor?: string;
}

const RoomBtn2 = styled.input<RoomBtn2Props>`
    width: calc(50% - 5px);
    padding: 6px 0;
    background-color: ${(props) => props.bgcolor ? props.bgcolor : "transparent"};
    border: 1px solid ${(props) => props.bordercolor ? props.bordercolor : "transparent"};
    border-radius: 2px;
    font-size: 12px;
    font-weight: 400;
    color: ${(props) => props.bordercolor ? props.bordercolor : "#ffffff"};
    cursor: pointer;
    &:hover{
        opacity: .8;
    }
    @media screen and (max-width: 560px){
        padding: 4px 0;
    }
`;

export default function RoomList({setRoomDocId} : RoomDocIdFormProps) {
    const user = auth.currentUser;
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        let unsubscribe : Unsubscribe | null = null;
        const fetchRoom = async () => {
            const roomsQuery = query(
                collection(db, "rooms"),
                orderBy("userListCnt", "desc"),
                limit(25)
            );
            unsubscribe = await onSnapshot(roomsQuery, (snapshot) => {
                const rooms = snapshot.docs.map((doc) => {
                    const {roomname, userListId, ownerusername, owneruserId} = doc.data();
                    return {
                        id: doc.id,
                        roomname, userListId, ownerusername,
                        isMember: user ? userListId.includes(user.uid) : false,
                        isOwner: user && owneruserId === user.uid ? true : false
                    }
                });
                setRooms(rooms);
            });
        }
        fetchRoom();
        return () => {
            unsubscribe && unsubscribe();
        }
    }, [user]);
    const onClickRoomInOut = async (e: React.MouseEvent<HTMLInputElement>) => {
        if(!user) return;
        try{
            const target = e.target as HTMLInputElement;
            const roomRef = doc(db, "rooms", target.dataset.id || "");
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                if (roomData.userListId.includes(user.uid)) { // 그룹 탈퇴
                    if(user.uid === roomData.owneruserId) { // 그룹 개설자는 그룹 탈퇴 불가능.
                        alert(`"${roomData.roomname}" 그룹 개설자인 "${roomData.ownerusername}"님은 그룹을 탈퇴하실 수 없습니다.\n 그룹 삭제 버튼을 이용해주시기 바랍니다.`);
                        return;
                    }
                    if(confirm(`"${roomData.roomname}" 그룹에서 탈퇴하시겠습니까?`)){
                        await updateDoc(roomRef, {
                            userListId: arrayRemove(user.uid),
                            userListCnt: increment(-1),
                        });
                        alert(`"${roomData.roomname}" 그룹에서 탈퇴하였습니다.`);
                    }else{
                        alert(`"${roomData.roomname}" 그룹 탈퇴를 취소하였습니다.`);
                    }
                }else{ // 그룹 가입
                    if(confirm(`"${roomData.roomname}" 그룹에 가입하시겠습니까?`)){
                        if (roomData.password === "") { // 공개 그룹
                            await updateDoc(roomRef, {
                                userListId: arrayUnion(user.uid), // 배열에 중복값없이 값 추가 ( 중복값이라면 추가되지 않는다. )
                                userListCnt: increment(1),
                            });
                        }else{ // 비공개 그룹
                            const passwordInput = prompt("비밀번호를 입력해주세요.");
                            if (passwordInput === roomData.password) { // string
                                await updateDoc(roomRef, {
                                    userListId: arrayUnion(user.uid), // 배열에 중복값없이 값 추가 ( 중복값이라면 추가되지 않는다. )
                                    userListCnt: increment(1),
                                });
                            }else{
                                alert("비밀번호가 틀렸습니다.");
                                return;
                            }
                        }
                        alert(`"${roomData.roomname}" 그룹에 가입 되었습니다.`);
                    }else{
                        alert(`"${roomData.roomname}" 그룹에 가입을 취소하였습니다.`);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    const onClickRoomDel = async (e: React.MouseEvent<HTMLInputElement>) => {
        if(!user) return;
        try{
            const target = e.target as HTMLInputElement;
            const roomRef = doc(db, "rooms", target.dataset.id || "");
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                if(user.uid === roomData.owneruserId) { // 그룹 개설자를 한번 더 검증 후 그룹 삭제
                    if(confirm(`"${roomData.roomname}" 그룹을 정말로 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)){
                        await deleteDoc(roomRef);  // Delete the document
                        alert(`"${roomData.roomname}" 그룹이 성공적으로 삭제되었습니다.`);
                    }else{
                        alert(`"${roomData.roomname}" 그룹 삭제가 취소되었습니다.`);
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }
    const navigateToHome = () => {
      navigate("/");
    };
    const numberPad = (n:string, width:number) => {
        n = n + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
      }
    return (
        <Wrapper>
            <RoomUl>
                {rooms.map(room => 
                    <RoomLi key={room.id}>
                        <p className="inforBox1">{room.roomname}</p>
                        <hr />
                        <p className="inforBox2">
                            <span>{`그룹개설자 : ${room.ownerusername}`}</span>
                            <span>{`회원수 : ${numberPad(room.userListId.length.toString(),2)}`}</span>
                        </p>
                        <RoomBtn>
                            {!room.isMember ?
                            <RoomBtn1 type="button" onClick={onClickRoomInOut} value="그룹 가입" data-id={room.id} />
                            :    
                            <div className="inner">
                                {room.isOwner ? 
                                <RoomBtn2 type="button" onClick={onClickRoomDel} value="그룹 삭제" data-id={room.id} bordercolor="#f50404"/> 
                                : 
                                <RoomBtn2 type="button" onClick={onClickRoomInOut} value="그룹 탈퇴" data-id={room.id} bordercolor="#AAAAAA" />
                                }
                                <RoomBtn2 type="button" onClick={() => {setRoomDocId(room.id); navigateToHome(); }} value="그룹 입장" bgcolor="#7D7D7D" />
                            </div>
                            }
                        </RoomBtn>
                    </RoomLi>
                )}
            </RoomUl>
        </Wrapper>
    )
}