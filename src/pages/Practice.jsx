import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { assignmentService, executionService } from '../services/api';
import {
  ArrowLeft, Play, Lightbulb, CheckCircle2, XCircle,
  Database, Code2, Table, Clock, RefreshCw, FileText,
  List, Download, ChevronUp, ChevronDown, ChevronsUpDown,
  History, X, Sparkles, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/components/_practice.scss';

// ─── Monaco custom dark theme ─────────────────────────────────────────────
const CIPHER_THEME = {
  base: 'vs-dark', inherit: true,
  rules: [
    { token: 'keyword',    foreground: '818cf8', fontStyle: 'bold' },
    { token: 'string',     foreground: '34d399' },
    { token: 'number',     foreground: 'fb923c' },
    { token: 'comment',    foreground: '4b5563', fontStyle: 'italic' },
    { token: 'identifier', foreground: 'e2e8f0' },
  ],
  colors: {
    'editor.background':             '#0e1422',
    'editor.foreground':             '#f1f5f9',
    'editor.lineHighlightBackground':'#141928',
    'editor.selectionBackground':    '#6366f130',
    'editorCursor.foreground':       '#6366f1',
    'editorLineNumber.foreground':   '#374151',
    'editorLineNumber.activeForeground': '#6366f1',
  },
};

const DEFAULT_QUERY = '-- Write your SQL query here\n-- Press Ctrl+Enter to run\n\nSELECT ';

// ─── Inline sample-data table ─────────────────────────────────────────────
function SampleTable({ tableName, columns, rows, error }) {
  if (error) return (
    <div className="sample-table__error">⚠️ {error}</div>
  );
  return (
    <div className="sample-table">
      <div className="sample-table__name">
        <Database size={12} /> {tableName}
        <span className="sample-table__count">{rows.length} rows</span>
      </div>
      <div className="sample-table__wrap">
        <table>
          <thead>
            <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c}>
                    {row[c] === null ? <em style={{ opacity: .4 }}>NULL</em> : String(row[c])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Left panel tab content ──────────────────────────────────────────────
function LeftPanelContent({ tab, assignment, sampleData, loadingSample }) {
  if (tab === 'question') {
    return (
      <div className="tab-content tab-content--question">
        <div className="assignment-info__badges">
          <span className={`badge badge--${assignment.difficulty}`}>{assignment.difficulty}</span>
          <span className="badge badge--points">⚡ {assignment.points} pts</span>
          {assignment.completed && <span className="badge badge--accent"><CheckCircle2 size={12}/> Completed</span>}
        </div>
        
        <h2 className="tab-content__title">{assignment.title}</h2>
        
        <div className="tab-content__section">
          <div className="tab-content__section-label">Task Description</div>
          <p className="tab-content__description">{assignment.description}</p>
        </div>

        {assignment.requirements && assignment.requirements.length > 0 && (
          <div className="tab-content__section">
            <div className="tab-content__section-label">Requirements</div>
            <ul className="tab-content__list">
              {assignment.requirements.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="tab-content__section">
          <div className="tab-content__section-label">Topic</div>
          <div className="tab-content__topic-pill">{assignment.topic}</div>
        </div>
      </div>
    );
  }

  if (tab === 'schema') {
    return (
      <div className="tab-content tab-content--schema">
        <div className="tab-content__section-label">Database Schema</div>
        <p className="tab-content__help-text">
          Use these table headers in your SQL query.
        </p>
        <pre className="schema-viewer__code">{assignment.schema || '-- No schema information provided'}</pre>
      </div>
    );
  }

  if (tab === 'data') {
    if (loadingSample) return (
      <div className="tab-content">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner spinner--lg" />
        </div>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Loading database tables…</p>
      </div>
    );
    
    if (!sampleData || sampleData.length === 0) return (
      <div className="tab-content">
        <div className="empty-state">
           <Database size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <p>No sample data available for this assignment.</p>
        </div>
      </div>
    );

    return (
      <div className="tab-content tab-content--data">
        <div className="tab-content__section-label">Pre-loaded Tables</div>
        <p className="tab-content__help-text">
          This data is currently inside the database and available to query.
        </p>
        <div className="sample-tables-container">
          {sampleData.map((tbl) => (
            <SampleTable key={tbl.tableName} {...tbl} />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Sort icon component ─────────────────────────────────────────────────
function SortIcon({ direction }) {
  if (direction === 'asc') return <ChevronUp size={12} className="sort-icon sort-icon--active" />;
  if (direction === 'desc') return <ChevronDown size={12} className="sort-icon sort-icon--active" />;
  return <ChevronsUpDown size={12} className="sort-icon" />;
}

// ─── Hint Level Dots ─────────────────────────────────────────────────────
function HintLevelDots({ level, max = 3 }) {
  return (
    <div className="hint-level-dots">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className={`hint-level-dots__dot ${i < level ? 'hint-level-dots__dot--filled' : ''}`}
        />
      ))}
      <span className="hint-level-dots__label">Level {level}/{max}</span>
    </div>
  );
}

// ─── Hint Shimmer ────────────────────────────────────────────────────────
function HintShimmer() {
  return (
    <div className="hint-shimmer">
      <div className="hint-shimmer__line hint-shimmer__line--long" />
      <div className="hint-shimmer__line hint-shimmer__line--medium" />
    </div>
  );
}

// ─── Export to CSV helper ─────────────────────────────────────────────────
function exportCSV(columns, rows, filename = 'query-results.csv') {
  const header = columns.join(',');
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = row[c];
      if (val === null || val === undefined) return '';
      const str = String(val);
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str;
    }).join(',')
  ).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────
export default function Practice() {
  const { id } = useParams();
  const editorRef = useRef(null);

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('question');
  const [sampleData, setSampleData] = useState(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [passed, setPassed] = useState(false);

  const [hintIndex, setHintIndex] = useState(0);
  const [currentHint, setCurrentHint] = useState(null);
  const [fetchingHint, setFetchingHint] = useState(false);

  // Editor status bar state
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Query history (last 5)
  const [queryHistory, setQueryHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Results table sorting
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(null); // 'asc' | 'desc' | null

  // Load assignment
  useEffect(() => {
    async function load() {
      try {
        const res = await assignmentService.getById(id);
        const a = res.data.assignment;
        setAssignment(a);
        setPassed(a.completed || false);
      } catch {
        toast.error('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Lazy-load sample data when user clicks the tab
  useEffect(() => {
    if (activeTab !== 'data' || sampleData !== null) return;
    setLoadingSample(true);
    assignmentService.getSampleData(id)
      .then((res) => setSampleData(res.data.tables))
      .catch(() => toast.error('Could not load sample data'))
      .finally(() => setLoadingSample(false));
  }, [activeTab, id, sampleData]);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme('cipher-dark', CIPHER_THEME);
    monaco.editor.setTheme('cipher-dark');

    // Track cursor position for status bar
    editor.onDidChangeCursorPosition((e) => {
      setCursorPos({ line: e.position.lineNumber, col: e.position.column });
    });

    editor.addAction({
      id: 'run-query',
      label: 'Run SQL Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => executeQuery(),
    });
  };

  const executeQuery = useCallback(async () => {
    if (!query.trim() || running) return;
    setRunning(true);
    setResult(null);
    setSortCol(null);
    setSortDir(null);

    // Save to history
    const trimmed = query.trim();
    setQueryHistory((prev) => {
      const filtered = prev.filter((q) => q !== trimmed);
      return [trimmed, ...filtered].slice(0, 5);
    });

    try {
      const res = await executionService.execute({ assignmentId: id, query: trimmed, hintIndex });
      const data = res.data;
      setResult(data.studentResult);
      setPassed(data.passed);
      if (data.passed) {
        toast.success(`✅ Correct! +${data.pointsEarned} points`, { duration: 4000 });
        setCurrentHint(null);
      } else {
        if (data.hint) setCurrentHint(data.hint);
        toast.error(data.studentResult?.error ? 'SQL Error — check syntax' : 'Not quite! Check the hint 💡');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Execution failed');
    } finally {
      setRunning(false);
    }
  }, [query, id, hintIndex, running]);

  const fetchHint = useCallback(async () => {
    if (fetchingHint) return;
    setFetchingHint(true);
    const nextIdx = currentHint ? hintIndex + 1 : hintIndex;
    try {
      const res = await executionService.getHint({ assignmentId: id, query, hintIndex: nextIdx });
      console.log("HINT RESPONSE:", res.data); // ADDED FOR DEBUGGING
      
      const hintObj = res.data;
      const hintText = hintObj.hint || (typeof hintObj === 'string' ? hintObj : JSON.stringify(hintObj));
      
      setQuery(prev => {
        const text = prev.trim();
        const hintComment = `\n\n-- 💡 AI Hint #${nextIdx + 1}:\n-- ${hintText.split('\n').join('\n-- ')}\n`;
        return text ? text + hintComment : hintComment.trimStart();
      });
      
      setCurrentHint(hintObj);
      setHintIndex(nextIdx);
    } catch (err) {
      toast.error('Could not fetch hint');
    } finally {
      setFetchingHint(false);
    }
  }, [fetchingHint, currentHint, hintIndex, id, query]);

  const reset = () => {
    setQuery(DEFAULT_QUERY);
    setResult(null);
    setCurrentHint(null);
    setPassed(false);
    setHintIndex(0);
    setSortCol(null);
    setSortDir(null);
  };

  // Column sort handler
  const handleSort = (col) => {
    if (sortCol !== col) {
      setSortCol(col);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortCol(null);
      setSortDir(null);
    }
  };

  // Sorted rows
  const getSortedRows = () => {
    if (!result?.rows) return [];
    if (!sortCol || !sortDir) return result.rows;
    return [...result.rows].sort((a, b) => {
      const av = a[sortCol];
      const bv = b[sortCol];
      if (av === null) return 1;
      if (bv === null) return -1;
      const cmp = isNaN(av) || isNaN(bv)
        ? String(av).localeCompare(String(bv))
        : Number(av) - Number(bv);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  };

  // ── Tabs config ──────────────────────────────────────────────────────
  const tabs = [
    { id: 'question', label: 'Question',    icon: <FileText size={14} /> },
    { id: 'data',     label: 'Sample Data', icon: <List size={14} /> },
    { id: 'schema',   label: 'Schema',      icon: <Database size={14} /> },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
      <div className="spinner spinner--lg" />
    </div>
  );

  if (!assignment) return (
    <div className="empty-state">
      <div className="empty-state__icon">❌</div>
      <p>Assignment not found.</p>
      <Link to="/assignments">Go Back</Link>
    </div>
  );

  const sortedRows = getSortedRows();
  const hintsExhausted = currentHint?.exhausted;

  return (
    <div className="practice-page">
      {/* ══ LEFT PANEL ══ */}
      <div className="practice-left">
        {/* Back button */}
        <Link to="/assignments" className="practice-back-btn">
          <ArrowLeft size={14} /> All Assignments
        </Link>

        {/* Tab switcher */}
        <div className="practice-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`practice-tabs__btn${activeTab === t.id ? ' practice-tabs__btn--active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Tab content card */}
        <div className="practice-info-card">
          <LeftPanelContent
            tab={activeTab}
            assignment={assignment}
            sampleData={sampleData}
            loadingSample={loadingSample}
          />
        </div>
      </div>

      {/* ══ RIGHT PANEL ══ */}
      <div className="practice-right">

        {/* Monaco editor */}
        <div className="editor-container">
          <div className="editor-container__toolbar">
            <div className="editor-container__title"><Code2 size={16} /> SQL Editor</div>
            <div className="editor-container__actions">
              {/* Query History */}
              {queryHistory.length > 0 && (
                <div className="query-history-wrap">
                  <button
                    className="btn-ghost"
                    onClick={() => setShowHistory((v) => !v)}
                    title="Query History"
                  >
                    <History size={14} /> History
                  </button>
                  {showHistory && (
                    <div className="query-history-dropdown">
                      <div className="query-history-dropdown__header">
                        Recent Queries
                        <button onClick={() => setShowHistory(false)}><X size={12} /></button>
                      </div>
                      {queryHistory.map((q, i) => (
                        <button
                          key={i}
                          className="query-history-dropdown__item"
                          onClick={() => {
                            setQuery(q);
                            setShowHistory(false);
                          }}
                        >
                          <span className="query-history-dropdown__num">{i + 1}</span>
                          <span className="query-history-dropdown__text">{q}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* AI Hint Button moved to Toolbar */}
              {!passed && (
                <button 
                  className="btn-ghost" 
                  style={{ color: '#fbbf24', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                  onClick={fetchHint} 
                  disabled={fetchingHint || hintsExhausted}
                  title={hintsExhausted ? "All hints used" : "Get AI Hint directly in editor"}
                >
                  {fetchingHint ? <span className="spinner spinner--sm" style={{borderColor: '#fbbf24', borderRightColor: 'transparent'}}></span> : <Sparkles size={14} />} 
                  {fetchingHint ? ' Thinking...' : hintsExhausted ? ' Hints Exhausted' : ' Context Hint'}
                </button>
              )}

              <button className="btn-ghost" onClick={reset}><RefreshCw size={14} /> Reset</button>
              <button className="btn-success" onClick={executeQuery} disabled={running || !query.trim()}>
                {running
                  ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Running…</>
                  : <><Play size={14} /> Run Query</>}
              </button>
            </div>
          </div>

          <div className="editor-container__monaco">
            <Editor
              height="340px"
              defaultLanguage="sql"
              value={query}
              onChange={(v) => setQuery(v || '')}
              onMount={handleEditorMount}
              options={{
                fontSize: 14,
                fontFamily: "'JetBrains Mono','Fira Code',monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                lineNumbers: 'on',
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16, bottom: 16 },
                suggestOnTriggerCharacters: true,
                formatOnPaste: true,
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                bracketPairColorization: { enabled: true },
                renderLineHighlight: 'line',
                smoothScrolling: true,
                cursorBlinking: 'expand',
                cursorSmoothCaretAnimation: 'on',
              }}
            />
          </div>

          {/* Status Bar */}
          <div className="editor-statusbar">
            <span className="editor-statusbar__item">
              <span className="editor-statusbar__label">Ln</span> {cursorPos.line}
              <span className="editor-statusbar__sep">·</span>
              <span className="editor-statusbar__label">Col</span> {cursorPos.col}
            </span>
            <span className="editor-statusbar__shortcut">
              <kbd>Ctrl+Enter</kbd> Run &nbsp;·&nbsp; <kbd>Ctrl+Z</kbd> Undo &nbsp;·&nbsp; Columns from Schema tab
            </span>
          </div>
        </div>

        {/* Results Panel */}
        <div className="results-panel">
          <div className="results-panel__header">
            <div className="results-panel__title"><Table size={16} /> Query Results</div>
            <div className="results-panel__header-right">
              {result && !result.error && result.rows?.length > 0 && (
                <>
                  <span className="results-panel__meta">
                    <Clock size={12} /> {result.executionTime}ms
                  </span>
                  <span className="results-panel__badge">{result.rows.length} rows</span>
                  <button
                    className="btn-export"
                    title="Export as CSV"
                    onClick={() => exportCSV(result.columns, result.rows, `${assignment.title.replace(/\s+/g, '_')}_results.csv`)}
                  >
                    <Download size={13} /> CSV
                  </button>
                </>
              )}
            </div>
          </div>

          {!result && (
            <div className="results-panel__empty">
              <Table size={36} style={{ opacity: 0.15 }} />
              <p>Run a query to see results here</p>
            </div>
          )}

          {result?.error && (
            <div className="results-panel__error">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <XCircle size={16} color="#ef4444" />
                <strong style={{ color: '#ef4444', fontSize: '0.875rem' }}>SQL Error</strong>
              </div>
              <pre className="error-code">{result.error}</pre>
            </div>
          )}

          {result && !result.error && (
            <>
              {passed && (
                <div className="results-panel__success-banner">
                  <CheckCircle2 size={20} color="#10b981" />
                  <div>
                    <div className="banner-text">🎉 Correct! Query matched expected output.</div>
                    <div className="banner-pts">Points awarded for this assignment</div>
                  </div>
                </div>
              )}

              {result.rows?.length > 0 ? (
                <div className="results-panel__table-wrap">
                  <table className="results-panel__table">
                    <thead>
                      <tr>
                        <th className="results-panel__th-index">#</th>
                        {result.columns.map((c) => (
                          <th
                            key={c}
                            className="results-panel__th-sortable"
                            onClick={() => handleSort(c)}
                            title={`Sort by ${c}`}
                          >
                            <span className="results-panel__th-inner">
                              {c}
                              <SortIcon direction={sortCol === c ? sortDir : null} />
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRows.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'results-panel__tr-even' : ''}>
                          <td className="results-panel__td-index">{i + 1}</td>
                          {result.columns.map((c) => (
                            <td key={c}>
                              {row[c] === null ? <em style={{ opacity: .4 }}>NULL</em> : String(row[c])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="results-panel__empty"><p>Query returned 0 rows</p></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
