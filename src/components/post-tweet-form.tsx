import styled from "styled-components"
import { useState } from "react"
import { addDoc, collection, updateDoc } from "firebase/firestore";
import { auth, db, storage } from "../firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TextArea = styled.textarea`
    border: 2px solid #ffffff;
    padding: 20px;
    border-radius: 20px;
    font-size: 16px;
    color: #ffffff;
    background-color: #000000;
    width: 100%;
    resize: none;
    &::placeholder{
        font-size: 16px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    &:focus {
        outline: none;
        border-color: #1d9bf9;
    }
`;

const AttachFileButton = styled.label`
    padding: 10px 0;
    color: #1d9bf9;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1d9bf9;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: .4s;
    &:hover{
        background-color: #1d9bf9;
        color: #ffffff;
    }
`;

const AttachFileInput = styled.input`
    display: none;
`;
const SubmitBtn = styled.input`
    background-color: #1d9bf9;
    color: #ffffff;
    border: none;
    padding: 10px 0;
    border-radius: 20px;
    font-size: 16px;
    cursor: pointer;
    transition: .4s;
    &:hover,
    &:active{
        background-color: #ffffff;
        color: #1d9bf9;
    }
`;

export default function PostTweetForm() {
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
            <TextArea rows={5} maxLength={200} onChange={onChange} value={tweet} placeholder="what is happening?" required />
            <AttachFileButton htmlFor="file">{file ? "Photo added ✔":"Add photo"}</AttachFileButton>
            <AttachFileInput onChange={onFileChange} type="file" id="file" accept="image/*" />
            <SubmitBtn type="submit" value={isLoading ? "Posting...":"Post Tweet"} />
        </Form>
    )
}