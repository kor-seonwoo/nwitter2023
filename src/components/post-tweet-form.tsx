import styled from "styled-components"
import { useState } from "react"
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { IRoomDocContext } from "../routes/home";

const Form = styled.form`
    position: fixed;
    bottom: 10px;
    right: 10px;
    width: calc(100% - 20px);
    max-width: 560px;
    padding: 15px;
    background-color: #ffffff;
    box-shadow: 2px 2px 8px rgba(42,42,42,0.2);
    > .inner{
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        margin-top: 10px;
    }
`;

const TextArea = styled.textarea`
    border: 2px solid #E2E2E2;
    width: 100%;
    padding: 20px;
    font-size: 16px;
    resize: none;
    &::placeholder{
        font-size: 16px;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf9;
    }
`;

const AttachFileButton = styled.label`
    display: inline-block;
    width: 100px;
    height: 30px;
    line-height: 30px;
    border: 1px solid #1d9bf9;
    text-align: center;
    font-size: 15px;
    font-weight: 600;
    color: #1d9bf9;
    cursor: pointer;
    &:hover{
        background-color: #1d9bf9;
        color: #ffffff;
    }
`;

const AttachFileInput = styled.input`
    display: none;
`;

const SubmitBtn = styled.input`
    width: 100px;
    height: 30px;
    line-height: 30px;
    background-color: #ffffff;
    border: 1px solid #1d9bf9;
    color: #1d9bf9;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    &:hover,
    &:active{
        background-color: #1d9bf9;
        color: #ffffff;
    }
`;

export default function PostTweetForm({ roomDocId } : IRoomDocContext) {
    const [isLoading, setLoading] = useState(false);
    const [tweet, setTweet] = useState("");
    const [file, setFile] = useState<File|null>(null);
    const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTweet(e.target.value);
    }
    const onFileChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {files} = e?.target;
        if (files && files.length === 1){
            setFile(files[0]);
        }
    }
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const user = auth.currentUser;
        if(!user || isLoading || tweet === "" || tweet.length > 200) return;
        try{
            setLoading(true);
            const doc = await addDoc(collection(db, "tweets"), {
                tweet,
                createdAt: Date.now(),
                username: user.displayName || "Anonymous",
                userId: user.uid,
                roomDocId
            });
            if (file && file.size < 1024 ** 2) {
                const locationRef = ref(storage, `tweets/${user.uid}/${doc.id}`);
                const result = await uploadBytes(locationRef, file);
                const url = await getDownloadURL(result.ref);
                await updateDoc(doc, {
                    photo: url,
                });
            }
            setTweet("");
            setFile(null);
        } catch(e) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    }
    return (
        <Form onSubmit={onSubmit}>
            <TextArea rows={5} maxLength={200} onChange={onChange} value={tweet} placeholder="당신의 이야기를 적어주세요." required />
            <div className="inner">
                <AttachFileButton htmlFor="file">{file ? "사진 선택 ✔":"사진 추가"}</AttachFileButton>
                <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
                <SubmitBtn type="submit" value={isLoading ? "작성중...":"작성"} />
            </div>
        </Form>
    )
}