package testutil

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/PuerkitoBio/goquery"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/require"
)

func CallWebAPIRequestHandler(
	t *testing.T,
	handler echo.HandlerFunc,
	method string,
	route string,
	params map[string]string,
	body interface{},
	res interface{},
) {
	e := echo.New()

	var req *http.Request
	if body != nil {
		dataJSON, err := json.Marshal(body)
		require.NoError(t, err)
		req = httptest.NewRequest(method, "/", bytes.NewReader(dataJSON))
	} else {
		req = httptest.NewRequest(method, "/", nil)
	}
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)

	rec := httptest.NewRecorder()

	c := e.NewContext(req, rec)
	c.SetPath(route)

	paramNames := make([]string, 0)
	paramValues := make([]string, 0)
	for k, v := range params {
		paramNames = append(paramNames, k)
		paramValues = append(paramValues, v)
	}
	c.SetParamNames(paramNames...)
	c.SetParamValues(paramValues...)

	err := handler(c)
	require.NoError(t, err)

	require.Equal(t, http.StatusOK, rec.Code)

	if res != nil {
		err = json.Unmarshal(rec.Body.Bytes(), res)
		require.NoError(t, err)
	}
}

func CallHTMLRequestHandler(t *testing.T, e *echo.Echo, handler echo.HandlerFunc, route string, params map[string]string) *goquery.Document {
	req := httptest.NewRequest(http.MethodGet, "/", nil)

	rec := httptest.NewRecorder()

	c := e.NewContext(req, rec)
	c.SetPath(route)

	paramNames := make([]string, 0)
	paramValues := make([]string, 0)
	for k, v := range params {
		paramNames = append(paramNames, k)
		paramValues = append(paramValues, v)
	}
	c.SetParamNames(paramNames...)
	c.SetParamValues(paramValues...)

	err := handler(c)
	require.NoError(t, err)

	require.Equal(t, http.StatusOK, rec.Code)

	doc, err := goquery.NewDocumentFromReader(rec.Body)
	require.NoError(t, err)

	{
		h, err := doc.Html()
		require.NoError(t, err)
		t.Log(h)
	}

	return doc
}
