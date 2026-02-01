package com.chatconnect.chatservice.controller;

import com.chatconnect.chatservice.kafka.KafkaProducer;
import com.chatconnect.chatservice.model.Message;
import com.chatconnect.chatservice.model.MessageDTO;
import com.chatconnect.chatservice.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    
    private final KafkaProducer kafkaProducer;
    private final ChatService chatService;
    
    @MessageMapping("/send")
    public void sendMessage(@Payload MessageDTO messageDTO) {
        // Set timestamp if not present
        if (messageDTO.getTimestamp() == null) {
            messageDTO.setTimestamp(LocalDateTime.now());
        }
        
        // Send to Kafka
        kafkaProducer.sendMessage(messageDTO);
    }
    
    @GetMapping("/rooms/{room}/history")
    public ResponseEntity<List<MessageDTO>> getRoomHistory(@PathVariable String room) {
        List<MessageDTO> history = chatService.getRoomHistory(room);
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running");
    }
}

