import { useState } from "react"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import { Error, Form, Input, Switcher, Title, Wrapper } from "../components/auth-components";
import { doc, setDoc } from "firebase/firestore";

export default function CreateAccount() {
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const onChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        const {target : {name, value}} = e;
        if (name === "name") {
            setName(value);
        }else if (name === "email"){
            setEmail(value);
        }else if (name === "password"){
            setPassword(value);
        }
    }
    const onSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        if (isLoading || name === "" || email === "" || password === "") return;
        try {
            setLoading(true);
            const credentials =  await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(credentials.user, {
                displayName: name,
            });
            const docRef = doc(db,'userList',credentials.user.uid);
            await setDoc(docRef,{
                name:name,
                email:email,
                hasProfileImage:false,
            });
            navigate("/");
        } catch (e) {
            if (e instanceof FirebaseError) {
                setError(e.message);
            }
        } finally {
            setLoading(false);
        }
    }
    return (
        <Wrapper>
            <Title>회원가입 ✔</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="name" value={name} placeholder="이름" type="text" required />
                <Input onChange={onChange} name="email" value={email} placeholder="이메일" type="email" required />
                <Input onChange={onChange} name="password" value={password} placeholder="비밀번호" type="password" required />
                <Input type="submit" value={isLoading?"회원가입 중...":"회원가입"} />
            </Form>
            {error !== "" ? <Error>{error}</Error>:null}
            <Switcher>
                이미 계정이 있으신가요?{""}
                <Link to="/login">로그인 &rarr;</Link>
            </Switcher>
        </Wrapper>
    );
}