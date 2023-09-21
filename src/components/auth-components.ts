import styled from "styled-components";

export const Wrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 420px;
    padding: 50px 0;
`;

export const Title = styled.h1`
    font-size:  42px;
`;

export const Form = styled.form`
    margin: 50px 0 10px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
`;

export const Input = styled.input`
    padding: 10px 20px;
    border-radius: 50px;
    border: none;
    width: 100%;
    font-size: 16px;
    &[type="submit"] {
        cursor: pointer;
        &:hover{
            opacity: .8;
        }
    }
`;

export const Error = styled.span`
    font-weight: 600;
    color: red;
    text-align: center;
`;

export const Switcher = styled.span`
    margin-top: 20px;
    a{
        color: #1d9bf0;
        padding-left: 8px;
    }
`;