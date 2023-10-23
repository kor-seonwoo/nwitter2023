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
            let docRef = doc(db,'userList',credentials.user.uid);
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
            <Title>Join ✔</Title>
            <Form onSubmit={onSubmit}>
                <Input onChange={onChange} name="name" value={name} placeholder="Name" type="text" required />
                <Input onChange={onChange} name="email" value={email} placeholder="email" type="email" required />
                <Input onChange={onChange} name="password" value={password} placeholder="password" type="password" required />
                <Input type="submit" value={isLoading?"Loading...":"Create Account"} />
            </Form>
            {error !== "" ? <Error>{error}</Error>:null}
            <Switcher>
                이미 계정이 있으신가요?{""}
                <Link to="/login">Log in &rarr;</Link>
            </Switcher>
        </Wrapper>
    );
}