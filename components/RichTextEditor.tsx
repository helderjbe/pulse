import { EDITOR_CONSTANTS, UI_CONSTANTS } from "@/constants/AppConstants";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useNoteContent } from "@/hooks/useNoteContent";
import type { RichTextEditorProps } from "@/types";
import { handleComponentError } from "@/utils/errorHandling";
import {
  DEFAULT_TOOLBAR_ITEMS,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from "@10play/tentap-editor";
import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  StyleSheet,
  View,
} from "react-native";
import { StatusIndicator } from "@/components/ui/StatusIndicator";


/**
 * A rich text editor component with auto-save functionality.
 * Automatically saves content to the database when the user stops typing.
 * 
 * @param selectedDate - The date for which content is being edited
 * @param onContentSaved - Callback fired when content is successfully saved
 * @param isDatabaseReady - Whether the database is ready for operations
 */
export interface RichTextEditorRef {
  forceSave: () => Promise<void>;
}

const RichTextEditorComponent = forwardRef<RichTextEditorRef, RichTextEditorProps>(
function RichTextEditor({ selectedDate, onContentSaved, isDatabaseReady }, ref) {
  const backgroundColor = useThemeColor({}, "background");

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: "",
    bridgeExtensions: TenTapStartKit,
  });

  // Custom hooks for managing state and logic
  const { isLoading } = useNoteContent({
    selectedDate,
    isDatabaseReady,
    editor,
  });

  const { saveContent, isSaving, forceSave } = useAutoSave({
    selectedDate,
    isDatabaseReady,
    onContentSaved,
  });

  // Set up content change detection for auto-save
  useEffect(() => {
    if (!isDatabaseReady) return;

    const handleContentChange = async () => {
      try {
        const content = await editor.getHTML();
        saveContent(content);
      } catch (error) {
        handleComponentError('RichTextEditor', error, 'getting content for auto-save');
      }
    };

    // Use editor's built-in change events for more efficient content detection
    const changeInterval = setInterval(() => {
      if (!isLoading) {
        handleContentChange();
      }
    }, EDITOR_CONSTANTS.CONTENT_CHECK_INTERVAL_MS) as unknown as NodeJS.Timeout;

    return () => {
      if (changeInterval) {
        clearInterval(changeInterval);
      }
    };
  }, [isDatabaseReady, isLoading, editor, saveContent]);

  // Expose force save function via ref
  useImperativeHandle(ref, () => ({
    forceSave: () => forceSave(() => editor.getHTML()),
  }), [forceSave, editor]);


  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.toolbar}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
        <StatusIndicator isActive={isLoading || isSaving} />
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

export const RichTextEditor = React.memo(RichTextEditorComponent);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    minHeight: UI_CONSTANTS.TOOLBAR_MIN_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
  },
  editorContainer: {
    flex: 1,
    paddingHorizontal: UI_CONSTANTS.EDITOR_HORIZONTAL_PADDING,
  },
  editor: {
    flex: 1,
    fontSize: EDITOR_CONSTANTS.FONT_SIZE,
    lineHeight: EDITOR_CONSTANTS.LINE_HEIGHT,
    borderWidth: 0,
  },
});

// Add display name for better debugging
RichTextEditor.displayName = "RichTextEditor";

