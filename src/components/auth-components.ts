import styled from "styled-components";

export const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    max-width: 560px;
    height: 100%;
    margin: 0 auto;
    padding: 0 10px;
`;

export const Title = styled.h1`
    font-size: 42px;
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    margin: 40px 0 10px;
`;

export const Input = styled.input`
    width: 100%;
    font-size: 16px;
    padding: 10px 20px;
    background-color: #E2E2E2;
    border: none;
    &[type="submit"] {
        background-color: #1D9BF9;
        color: #ffffff;
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