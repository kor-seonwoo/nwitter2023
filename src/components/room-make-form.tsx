import styled from "styled-components"
import { useState } from "react"
import { addDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase";

const Wrapper = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    width: 100%;
`;

const WrapperInner = styled.div`
    width: calc(100% - 20px);
    max-width: 480px;
    padding: 20px;
    background-color: #ffffff;
    text-align: center;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

const RadioGroup = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 15px;
`;

const Radio = styled.label``;

const Input = styled.input`
    width: 100%;
    padding: 10px 20px;
    border: 1px solid #aaaaaa;
    font-size: 16px;
    &[type="submit"] {
        cursor: pointer;
        &:hover{
            opacity: .8;
        }
    }
`;

const SubmitBtn = styled.input`
    width: 100%;
    padding: 10px 0;
    background-color: #1d9bf9;
    border: none;
    font-size: 16px;
    color: #ffffff;
    cursor: pointer;
    &:hover{
        opacity: .8;
    }
`;

const CancelBtn = styled.button`
    width: 100%;
    padding: 10px 0;
    border: 1px solid #1d9bf9;
    background-color: #ffffff;
    font-size: 16px;
    color: #1d9bf9;
    cursor: pointer;
    &:hover{
        opacity: .8;
    }
`;

interface RoomMakeFormProps {
    modalDelete: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RoomMakeForm({ modalDelete }: RoomMakeFormProps) {
    const [isOpen, setOpen] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [roomname, setRoomname] = useState("");
    const [password, setPassword] = useState("");
    const onChangeInRadio = (e: React.ChangeEvent<HTMLInputElement>) => {
        (e.target.value === "0")? setOpen(false) : setOpen(true);
    }
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if(!user || isLoading || roomname === "") return;
        try{
            setLoading(true);
            await addDoc(collection(db, "rooms"), {
                owneruserId: user.uid,
                ownerusername: user.displayName || "Anonymous",
                userListId: [user.uid],
                userListCnt: 1,
                createdAt: Date.now(),
                roomname,
                password
            });
            setRoomname("");
            setPassword("");
        } catch(e) {
            console.log(e);
        } finally {
            setLoading(false);
            modalDelete(false);
            alert(`"${roomname}" 그룹을 생성하였습니다.`);
        }
    }
    return (
        <Wrapper>
            <WrapperInner>
                <RadioGroup>
                    <Radio>
                        <input type="radio" name="roomType" value="0" onChange={onChangeInRadio} defaultChecked />
                        &nbsp;공개
                    </Radio>
                    <Radio>
                        <input type="radio" name="roomType" value="1" onChange={onChangeInRadio} />
                        &nbsp;비공개
                    </Radio>
                </RadioGroup>
                <Form onSubmit={onSubmit}>
                    <Input name="roomname" value={roomname} onChange={(e) => setRoomname(e.target.value)} placeholder="그룹 이름을 입력해주세요. (최소2글자~최대11글자)" type="text" maxLength={11} minLength={2} required />
                    {isOpen ? <Input name="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호를 입력해주세요." type="password" required /> : null}
                    <SubmitBtn type="submit" value={isLoading ? "생성중...":"생성"} />
                    <CancelBtn type="button" onClick={() => modalDelete(false)}>취소</CancelBtn>
                </Form>
            </WrapperInner>
        </Wrapper>
    )
}