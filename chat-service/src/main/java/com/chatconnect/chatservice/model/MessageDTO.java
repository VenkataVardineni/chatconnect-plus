package com.chatconnect.chatservice.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String room;
    private String nickname;
    private String content;
    private LocalDateTime timestamp;
    
    public static MessageDTO fromEntity(Message message) {
        return new MessageDTO(
            message.getId(),
            message.getRoom(),
            message.getNickname(),
            message.getContent(),
            message.getTimestamp()
        );
    }
}

