import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import styled from "styled-components";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

const Button = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 100%;
    padding: 10px;
    background-color: #E2E2E2;
    margin-top: 50px;
    border: 0;
    font-weight: 600;
    cursor: pointer;
`;

const Logo = styled.img`
    height: 25px;
`;

export default function GithubButton() {
    const navigate = useNavigate();
    // const onClick = async () => {
    //     try{
    //         const provieder = new GithubAuthProvider();
    //         await signInWithPopup(auth, provieder);
    //         navigate("/");
    //     } catch (erroer){
    //         console.log(erroer);
    //     }
    // }
    const onClick = async () => {
        try{
            const provider = new GithubAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            if (user) {
                const docRef = doc(db,'userList',user.uid);
                await setDoc(docRef,{
                    name: user.displayName || '',
                    email: user.email || '',
                    hasProfileImage: user.photoURL ? user.photoURL : false,
                });
                navigate("/");
            } else {
                console.log('User information is not available.');
            }
        } catch (error){
            console.log(error);
        }
    }
    return (
        <Button onClick={onClick}>
            <Logo src="/github-logo.svg" />
            Github 계정으로 이용
        </Button>
    );
}