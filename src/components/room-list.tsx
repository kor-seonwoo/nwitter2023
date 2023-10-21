import styled from "styled-components";
import { auth, db } from "../firebase";
import { arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, increment, limit, onSnapshot, orderBy, query, updateDoc} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Unsubscribe } from "firebase/auth";

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

const Wrapper = styled.ul`
    width: 100%;
`;

const RoomLi = styled.li`
    border-top: 1px solid #aaaaaa;
`;

const RoomBtn1 = styled.input`
    width: 100%;
    padding: 15px 5px;
    text-align: left;
    background-color: transparent;
    border: 0;
    cursor: pointer;
`;

const RoomBtn2 = styled.input`
    background-color: #f5f5f5;
    text-align: left;
    border: 0;
    cursor: pointer;
`;

const MemberCount = styled.span`
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    background-color: #aaaaaa;
    border-radius: 50%;
    font-size: 12px;
    text-align: center;
`;


export default function RoomList() {
    const user = auth.currentUser;
    const [rooms, setRooms] = useState<IRoom[]>([]);
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
                        await updateDoc(roomRef, {
                            userListId: arrayUnion(user.uid), // 배열에 중복값없이 값 추가 ( 중복값이라면 추가되지 않는다. )
                            userListCnt: increment(1),
                        });
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
    return (
        <Wrapper>
            <RoomLi>
                <RoomBtn1 type="button" value="Live Feed" />
            </RoomLi>
            {rooms.map(room => 
                <RoomLi key={room.id}>
                    <p>{room.roomname}<MemberCount>{room.userListId.length}</MemberCount></p>
                    {`그룹개설자 : ${room.ownerusername}`}
                    <RoomBtn2 type="button" onClick={onClickRoomInOut} value={room.isMember ? "그룹 탈퇴":"그룹 가입"} data-id={room.id} />
                    {room.isOwner ? <RoomBtn2 type="button" onClick={onClickRoomDel} value="그룹 삭제" data-id={room.id} /> : null}
                </RoomLi>
            )}
        </Wrapper>
    )
}