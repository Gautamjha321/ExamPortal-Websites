package com.exam.examportal.helper;

public class UserFoundException extends Exception{

    public UserFoundException(){
        super("User with this username is already exist in DB");
    }

    public UserFoundException(String msg){
        super(msg);
    }
}
