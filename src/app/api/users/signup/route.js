import {connect} from "@/dbConfig/config";
import User from "@/models/user";
import {NextRequest, NextResponse} from "next/server";
import bcryptjs from "bcryptjs";
import {sendEmail} from "@/helpers/mailer";

connect();

export async function POST(request) {
  try {
    const reqBody = await request.json();
    const {email, username, password} = reqBody;

    const user = await User.findOne({email});
    if (user) {
      return NextResponse.json({error: "User already exists", statusCode: 400});
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new User({username, email, password: hashedPassword});
    const savedUser = await newUser.save();

    //verification
    await sendEmail({email, emailType: "VERIFY", id: savedUser._id});
    return NextResponse.json({
      message: `New user created with the following details`,
      user: newUser,
      statusCode: 200,
    });
  } catch (error) {
    return NextResponse({error: error.message, statusCode: 500});
  }
}
