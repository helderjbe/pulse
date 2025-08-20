import { useThemeColor } from "@/hooks/useThemeColor";
import { noteOperations } from "@/lib/database";
import {
  DEFAULT_TOOLBAR_ITEMS,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from "@10play/tentap-editor";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface RichTextEditorProps {
  selectedDate: string;
  onContentSaved?: () => void;
  isDatabaseReady: boolean;
}

export interface RichTextEditorRef {
  forceSave: () => Promise<void>;
}

export const RichTextEditor = forwardRef<
  RichTextEditorRef,
  RichTextEditorProps
>(({ selectedDate, onContentSaved, isDatabaseReady }, ref) => {
  const backgroundColor = useThemeColor({}, "background");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>("");
  const isLoadingContentRef = useRef(false);

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: "",
    bridgeExtensions: TenTapStartKit,
  });

  // Load note content when selectedDate changes
  useEffect(() => {
    const loadNote = async () => {
      if (!selectedDate || !isDatabaseReady || isLoadingContentRef.current)
        return;

      try {
        setIsLoading(true);
        isLoadingContentRef.current = true;

        const note = await noteOperations.getNote(selectedDate);
        const content = note?.text || "";

        // Only update if content is different to avoid unnecessary rerenders
        if (content !== lastSavedContentRef.current) {
          await editor.setContent(content);
          lastSavedContentRef.current = content;
        }
      } catch (error) {
        console.error("Failed to load note:", error);
      } finally {
        setIsLoading(false);
        isLoadingContentRef.current = false;
      }
    };

    loadNote();
  }, [selectedDate, isDatabaseReady, editor]);

  // Debounced save function
  const debouncedSave = useCallback(
    async (content: string) => {
      console.log("💾 Save attempt:", {
        selectedDate,
        isDatabaseReady,
        contentLength: content.length,
        isEmpty: !content || content === "<p></p>",
        lastSavedLength: lastSavedContentRef.current.length,
      });

      if (
        !selectedDate ||
        !isDatabaseReady ||
        content === lastSavedContentRef.current ||
        !content ||
        content === "<p></p>"
      ) {
        console.log("❌ Save skipped");
        return;
      }

      try {
        console.log("🚀 Saving to database...");
        setIsSaving(true);
        await noteOperations.saveNote(selectedDate, content);
        lastSavedContentRef.current = content;
        console.log("✅ Save successful!");

        // Notify parent component that content was saved
        onContentSaved?.();
      } catch (error) {
        console.error("💥 Save failed:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [selectedDate, isDatabaseReady, onContentSaved]
  );

  // Handle content changes with debouncing
  useEffect(() => {
    if (!isDatabaseReady) return;

    const handleContentChange = async () => {
      try {
        const content = await editor.getHTML();
        console.log("📝 Content change:", {
          contentLength: content.length,
          isDatabaseReady,
          isLoading: isLoadingContentRef.current,
          content: content.substring(0, 50) + "...",
        });

        // Clear existing timeout
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }

        // Set new timeout for debounced save
        saveTimeoutRef.current = setTimeout(() => {
          console.log("⏰ Timeout fired, calling save...");
          debouncedSave(content);
        }, 1000) as unknown as NodeJS.Timeout; // 1 second debounce
      } catch (error) {
        console.error("Failed to get editor content:", error);
      }
    };

    // Listen to editor state changes
    let interval: NodeJS.Timeout;

    const startListening = () => {
      // Check for content changes every 1 second while typing
      interval = setInterval(async () => {
        if (!isLoadingContentRef.current && isDatabaseReady) {
          handleContentChange();
        }
      }, 1000) as unknown as NodeJS.Timeout;
    };

    startListening();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, debouncedSave, isDatabaseReady]);

  // Force save function exposed through ref
  const forceSave = useCallback(async () => {
    try {
      const content = await editor.getHTML();
      console.log("Force save triggered with content length:", content.length);
      await debouncedSave(content);
    } catch (error) {
      console.error("Failed to force save:", error);
    }
  }, [editor, debouncedSave]);

  useImperativeHandle(
    ref,
    () => ({
      forceSave,
    }),
    [forceSave]
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.toolbar}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
        <TouchableOpacity
          style={styles.saveButton}
          onPress={forceSave}
          disabled={!isDatabaseReady}
        >
          <Text style={styles.saveButtonText}>💾</Text>
        </TouchableOpacity>
        {(isLoading || isSaving) && (
          <View style={styles.loadingIndicator}>
            <ActivityIndicator size="small" />
          </View>
        )}
      </View>
      <View style={styles.editorContainer}>
        <RichText
          style={[
            styles.editor,
            {
              backgroundColor,
            },
          ]}
          editor={editor}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 18,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  editor: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 0,
  },
});

// Add display name for better debugging
RichTextEditor.displayName = "RichTextEditor";
