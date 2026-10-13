package org.travel_stories.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public void sendPasswordResetOtp(
            String recipientEmail,
            String otp
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);
        message.setTo(recipientEmail);
        message.setSubject(
                "Travel Stories - Password Reset OTP"
        );

        message.setText(
                """
                Hello,

                We received a request to reset your Travel Stories password.

                Your password reset OTP is:

                %s

                This OTP is valid for 5 minutes.

                If you did not request a password reset,
                you can safely ignore this email.

                Regards,
                Travel Stories
                """.formatted(otp)
        );

        mailSender.send(message);
    }
}