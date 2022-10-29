package com.web.apicloud.controller;

import com.web.apicloud.domain.entity.Controller;
import com.web.apicloud.model.SynchronizeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/synchronize")
public class SynchronizeController {

    private final SynchronizeService synchronizeService;

    @GetMapping
    public ResponseEntity<Object> getFile() throws IOException {
        String root = "C:/S07P22B309";
        String name = "Program" + "Controller";
        Object response = synchronizeService.getFile(root, name);
        return ResponseEntity.ok()
                .body(null);
    }
}
