package com.web.apicloud.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.web.apicloud.domain.dto.*;
import com.web.apicloud.domain.vo.DocVO;
import com.web.apicloud.model.DocsService;
import com.web.apicloud.model.NotionService;
import com.web.apicloud.util.FileUtils;
import com.web.apicloud.util.ResponseHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/docs")
public class DocsController {
    private final DocsService docsService;

    private final NotionService notionService;

    // FIXME: controller 안의 로직 밖에서 수행하거나 해당 controller api 막기
    private final ProjectWithControllerGenerationController projectGenerationController;

    @PostMapping()
    public ResponseEntity<Object> createDoc(@RequestBody CreateDocRequest createDocRequest) {
        try {
            log.info("DOC 생성 API 호출");
            Long docId = docsService.saveDocGetDocId(createDocRequest);
            String encryptedUrl = docsService.encryptUrl(docId);
            return ResponseHandler.generateResponse("API DOC 생성에 성공했습니다.", HttpStatus.OK, "encryptedUrl", encryptedUrl);
        } catch (Exception e) {
            log.error("DOC 생성 API 에러", e);
            return ResponseHandler.generateResponse("API DOC 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping()
    public ResponseEntity<Object> getDocListByUser() {
        try {
            log.info("사용자별 DOC 리스트 조회 API 호출");
            List<DocListResponse> docListResponses = docsService.getDocs(1L);
            return ResponseHandler.generateResponse("사용자별 API DOC 리스트 조회에 성공했습니다.", HttpStatus.OK, "docList", docListResponses);
        } catch (Exception e) {
            log.info("사용자별 DOC 리스트 조회 API 에러", e);
            return ResponseHandler.generateResponse("사용자별 API DOC 리스트 조회에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{docId}")
    public ResponseEntity<Object> getSpecificDoc(@PathVariable Long docId) {
        try {
            log.info("특정 API DOC 조회 API 호출");
            UpdateDocDto updateDocDto = docsService.getDoc(docId);
            return ResponseHandler.generateResponse("특정 API DOC 조회에 성공했습니다.", HttpStatus.OK, "docInformation", updateDocDto);
        } catch (Exception e) {
            log.info("특정 API DOC 조회 API 에러", e);
            return ResponseHandler.generateResponse("특정 API DOC 조회에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{docId}")
    public ResponseEntity<Object> updateDoc(@PathVariable Long docId, @RequestBody UpdateDocDto updateDocDto) {
        try {
            log.info("DOC 수정 API 구현");
            UpdateDocDto updateDocResponse = docsService.updateDoc(docId, updateDocDto);
            return ResponseHandler.generateResponse("API DOC 수정에 성공했습니다.", HttpStatus.OK, "updateDocDto", updateDocResponse);
        } catch (Exception e) {
            log.info("DOC 수정 API 에러", e);
            return ResponseHandler.generateResponse("API DOC 수정에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{docId}")
    public ResponseEntity<Object> deleteDoc(@PathVariable Long docId) {
        try {
            log.info("DOC 삭제 API 구현");
            docsService.deleteDoc(docId);
            return ResponseHandler.generateResponse("API DOC 삭제에 성공했습니다.", HttpStatus.OK);
        } catch (Exception e) {
            log.info("DOC 삭제 API 에러", e);
            return ResponseHandler.generateResponse("API DOC 삭제에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{docsId}/project")
    public ResponseEntity<byte[]> exportProject(@PathVariable("docsId") Long docsId, @RequestHeader Map<String, String> headers) throws IOException {
        return projectGenerationController.springZip(docsService.getDocVOByDocsId(docsId), headers);
    }

    @GetMapping("/{docsId}/csv")
    public ResponseEntity<byte[]> exportCsv(@PathVariable("docsId") Long docsId) throws JsonProcessingException {
        DocVO doc = docsService.getDocVOByDocsId(docsId);
        byte[] file = docsService.getCsvFile(doc.getControllers());
        return FileUtils.createResponseEntity(file, "text/csv", doc.getServer().getName() + ".csv");
    }

    @PostMapping("/{docsId}/notion")
    public ResponseEntity<NotionExportResponse> exportNotion(@PathVariable("docsId") Long docsId,
                                                             @RequestBody(required = false) NotionExportRequest request) throws JsonProcessingException {
        DocVO doc = docsService.getDocVOByDocsId(docsId);
        notionService.makeApiPage(request.getToken(), request.getDatabaseId(), doc);
        return ResponseEntity.ok().body(new NotionExportResponse("https://www.notion.so/" + request.getDatabaseId()));
    }
}