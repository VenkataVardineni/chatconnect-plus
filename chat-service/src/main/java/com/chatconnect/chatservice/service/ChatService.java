package com.chatconnect.chatservice.service;

import com.chatconnect.chatservice.model.Message;
import com.chatconnect.chatservice.model.MessageDTO;
import com.chatconnect.chatservice.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    
    private final MessageRepository messageRepository;
    
    @Transactional
    public Message saveMessage(Message message) {
        return messageRepository.save(message);
    }
    
    @Transactional(readOnly = true)
    public List<MessageDTO> getRoomHistory(String room) {
        return messageRepository.findByRoomOrderByTimestampAsc(room)
                .stream()
                .map(MessageDTO::fromEntity)
                .collect(Collectors.toList());
    }
}

