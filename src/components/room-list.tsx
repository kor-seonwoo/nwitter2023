import styled from "styled-components";
import { auth, db } from "../firebase";
import { arrayUnion, collection, doc, getDoc, increment, limit, onSnapshot, orderBy, query, updateDoc} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Unsubscribe } from "firebase/auth";

export interface IRoom {
    id: string;
    roomname: string;
    userListId: Array<string>;
    ownerusername: string;
}

const Wrapper = styled.ul`
    width: 100%;
`;

const RoomLi = styled.li`
    border-top: 1px solid #aaaaaa;
`;

const RoomBtn = styled.button`
    width: 100%;
    padding: 15px 5px;
    text-align: left;
    background-color: transparent;
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
                    const {roomname, userListId, ownerusername} = doc.data();
                    return {
                        id: doc.id,
                        roomname, userListId, ownerusername,
                    }
                });
                setRooms(rooms);
            });
        }
        fetchRoom();
        return () => {
            unsubscribe && unsubscribe();
        }
    }, []);
    const onClick = async (e: React.FormEvent<HTMLButtonElement>) => {
        if (!user) return;
        try{
            const roomRef = doc(db, "rooms", e.currentTarget.value);
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                const roomData = roomSnap.data();
                if (roomData.userListId.includes(user.uid)) { // 이미 그룹에 가입되어있을 때.
                    
                }else{ // 그룹에 신규 가입할 때.
                    if(confirm(`"${roomData.roomname}" 그룹에 가입하시겠습니까?`)){
                        await updateDoc(roomRef, {
                            userListId: arrayUnion(user.uid),
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
    return (
        <Wrapper>
            <RoomLi>
                <RoomBtn type="button">Live Feed</RoomBtn>
            </RoomLi>
            {rooms.map(room => 
                <RoomLi key={room.id}>
                    <RoomBtn type="button" onClick={onClick} value={room.id}>
                        <p>{room.roomname}<MemberCount>{room.userListId.length}</MemberCount></p>
                        {`그룹개설자 : ${room.ownerusername}`}
                    </RoomBtn>
                </RoomLi>
            )}
        </Wrapper>
    )
}