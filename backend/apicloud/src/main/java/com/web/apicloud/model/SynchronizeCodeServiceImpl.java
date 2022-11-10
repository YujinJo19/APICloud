package com.web.apicloud.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.web.apicloud.domain.dto.CodeResponse;
import com.web.apicloud.domain.dto.DetailRequest;
import com.web.apicloud.domain.entity.Docs;
import com.web.apicloud.domain.entity.Group;
import com.web.apicloud.domain.vo.ApiDetailVO;
import com.web.apicloud.domain.vo.ApiVO;
import com.web.apicloud.domain.vo.ControllerVO;
import com.web.apicloud.domain.vo.PropertyVO;
import com.web.apicloud.exception.NotFoundException;
import com.web.apicloud.model.parsing.ParsingService;
import com.web.apicloud.model.parsing.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Slf4j
@RequiredArgsConstructor
@Service
public class SynchronizeCodeServiceImpl implements SynchronizeCodeService {

    private static final String REQUEST_MAPPING = "@RequestMapping";
    private static final String VALUE = "value";
    private static final String METHOD = "Mapping";
    private static final String RESPONSE_ENTITY = "ResponseEntity";
    private static final String REQUEST_PARAM = "RequestParam";
    private static final String PATH_VARIABLE = "PathVariable";
    private static final String REQUEST_BODY = "RequestBody";

    private static final String NOT_FOUND_FILE = "해당 파일을 찾을 수 없습니다.";

    private final DocsService docsService;
    private final GroupService groupService;
    private final S3Service s3Service;
    private final ParsingService parsingService;

    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static List<CodeResponse> codeList = new ArrayList<>();
    private int count = 0;

    @Override
    public List<CodeResponse> updateCode(Long docId, DetailRequest detailRequest) throws IOException {
        codeList = new ArrayList<>();
        count = 0;

        ControllerVO detailVO = objectMapper.readValue(detailRequest.getDetail(), ControllerVO.class);
        Docs doc = docsService.findByDocsId(docId);
        Group group = groupService.findById(doc.getGroup().getId());

        List<String> lines = s3Service.getFile(detailVO.getName(), null, group.getGroupSecretKey());
        if (lines == null) new NotFoundException(NOT_FOUND_FILE);

        codeList.add(CodeResponse.builder().name(detailVO.getName()).code(lines).build());
        getUpdateCode(detailVO);
        return codeList;
    }

    private void getUpdateCode(ControllerVO detailVO) {
        int i = 0;
        while (i < codeList.get(0).getCode().size()) {
            if (parsingService.KMP(codeList.get(0).getCode().get(i), REQUEST_MAPPING) != -1) {
                int target = parsingService.KMP(codeList.get(0).getCode().get(i), VALUE);
                String value = null;
                if (target != -1) {
                    value = parsingService.getValue(codeList.get(0).getCode().get(i).substring(target + 1, codeList.get(0).getCode().get(i).length()));
                } else {
                    value = parsingService.getValue(codeList.get(0).getCode().get(i));
                }
                // TODO : uri 없을 경우랑 삭제하는 경우 처리
                codeList.get(0).getCode().set(i, codeList.get(0).getCode().get(i).replace(value, detailVO.getCommonUri()));
                i++;
                break;
            }
            i++;
        }

        int start = i;
        while (i < codeList.get(0).getCode().size()) {
            if (parsingService.KMP(codeList.get(0).getCode().get(i), METHOD) != -1) {
                apiParsing(detailVO, start, i - 1);
                start = i;
            }
            i++;
        }
    }

    private void apiParsing(ControllerVO detailVO, int start, int end) {
        if (detailVO.getApis().size() <= count) return;
        updateMethodAndUri(detailVO, start);

        while (++start <= end) {
            if (parsingService.KMP(codeList.get(0).getCode().get(start), RESPONSE_ENTITY) != -1) {
                updateApi(detailVO, start, end);
                break;
            }
        }
        count++;
    }

    private void updateApi(ControllerVO detailVO, int start, int end) {
        System.out.println("updateApi ==> ");
        Stack<Character> stack = new Stack<>();
        boolean responseFlag = false;
        boolean requestFlag = false;
        boolean methodNameFlag = false;
        String response = "";
        String requestStr = "";
        Map<Integer, String> request = new HashMap<>();
        String methodName = "";

        ApiVO detailApiVO = detailVO.getApis().get(count);

        while (start <= end) {
            String line = codeList.get(0).getCode().get(start);
            for (int j = 0; j < line.length(); j++) {
                if (requestFlag) {
                    requestStr += line.charAt(j);
                    request.put(start, requestStr);
                }
                if (methodNameFlag) methodName += line.charAt(j);

                switch (line.charAt(j)) {
                    case '<':
                        stack.push('<');
                        if (!requestFlag) responseFlag = true;
                        break;
                    case '(':
                        stack.push('(');
                        if (methodNameFlag) {
                            methodNameFlag = false;
                            methodName = methodName.replaceAll(" ", "");
                            codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(methodName.substring(0, methodName.length() - 1), detailApiVO.getName()));
                        }
                        break;
                    case '{':
                        stack.push('{');
                        break;
                    case '[':
                        stack.push('[');
                        break;
                    case '>':
                        if (stack.peek() == '<') stack.pop();
                        if (!requestFlag) {
                            if (stack.isEmpty()) {
                                responseFlag = false;
                                PropertyVO responseBody = detailApiVO.getResponses().get("success").getResponseBody();
                                if (responseBody == null) {
                                    codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(response, ""));
                                } else {
                                    codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(response, responseBody.getDtoName()));
                                }
                                // TODO : response CLass 바꾸러 가기
                                methodNameFlag = true;
                            }
                        }
                        break;
                    case ')':
                        if (stack.peek() == '(') stack.pop();
                        if (stack.isEmpty()) {
                            System.out.println("request ==> ");
                            requestStr = requestStr.substring(0, requestStr.length() - 1);
                            request.put(start, requestStr);
                            checkRequestDetail(request);
                            System.out.println(codeList.get(0).getCode().get(start));

                            String api = makeApi(detailApiVO);
//                            codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(request, api));
//                            System.out.println();
                            return;
                        }
                        break;
                    case '}':
                        if (stack.peek() == '}') stack.pop();
                        break;
                    case ']':
                        if (stack.peek() == ']') stack.pop();
                        break;
                    case '@':
                        requestFlag = true;
                        requestStr += line.charAt(j);
                        request.put(start, requestStr);
                        break;
                    case ',':
                        if (stack.size() != 1) break;
                        checkRequestDetail(request);
                        requestStr = "";
                        request = new HashMap<>();
                        requestFlag = false;
                        break;
                    default:
                        if (responseFlag) response += line.charAt(j);
                }
            }
            start++;
        }
    }

    private void checkRequestDetail(Map<Integer, String> request) {
        Iterator<Map.Entry<Integer, String>> itr = request.entrySet().iterator();
        boolean flag = false;
        while (itr.hasNext()) {
            Map.Entry<Integer, String> entry = itr.next();
            if (parsingService.KMP(entry.getValue(), PATH_VARIABLE) != -1) {
                flag = true;
                break;
            }
            if (parsingService.KMP(entry.getValue(), REQUEST_PARAM) != -1) {
                flag = true;
                break;
            }
            if (parsingService.KMP(entry.getValue(), REQUEST_BODY) != -1) {
                flag = true;
                break;
            }
        }
        if (flag) {
            itr = request.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<Integer, String> entry = itr.next();
                codeList.get(0).getCode().set(entry.getKey(), codeList.get(0).getCode().get(entry.getKey()).replace(entry.getValue(), ""));
                codeList.get(0).getCode().set(entry.getKey(), codeList.get(0).getCode().get(entry.getKey()).replace(", )", ")"));
                codeList.get(0).getCode().set(entry.getKey(), codeList.get(0).getCode().get(entry.getKey()).replace(",)", ")"));   }
        }
    }

    private String makeApi(ApiVO detailApiVO) {
        return null;
    }

    private void updateMethodAndUri(ControllerVO detailVO, int start) {
        List<String> getMethod = parsingService.getMethod(codeList.get(0).getCode().get(start));
        if (getMethod == null) return;
        if (getMethod.size() > 0) {
            codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(getMethod.get(0), detailVO.getApis().get(count).getMethod()));
        }
        if (getMethod.size() > 1) {
            if (detailVO.getApis().get(count).getUri() == null) {
                codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(getMethod.get(1), ""));
            } else {
                codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start).replace(getMethod.get(1), detailVO.getApis().get(count).getUri()));
            }
        } else {
            if (detailVO.getApis().get(count).getUri() != null) {
                String uri = "(\"" + detailVO.getApis().get(count).getUri() + "\")";
                codeList.get(0).getCode().set(start, codeList.get(0).getCode().get(start) + uri);
            }
        }
    }
}
