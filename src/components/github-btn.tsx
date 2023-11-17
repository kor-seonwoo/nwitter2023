import { GithubAuthProvider, signInWithPopup } from "firebase/auth";
import styled from "styled-components";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

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
    const onClick = async () => {
        try{
            const provieder = new GithubAuthProvider();
            await signInWithPopup(auth, provieder);
            navigate("/");
        } catch (erroer){
            console.log(erroer);
        }
    }
    return (
        <Button onClick={onClick}>
            <Logo src="/github-logo.svg" />
            Github 계정으로 이용
        </Button>
    );
}