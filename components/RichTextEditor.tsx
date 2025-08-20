import { useThemeColor } from "@/hooks/useThemeColor";
import {
  DEFAULT_TOOLBAR_ITEMS,
  RichText,
  TenTapStartKit,
  Toolbar,
  useEditorBridge,
} from "@10play/tentap-editor";
import React from "react";
import { StyleSheet, View } from "react-native";

export function RichTextEditor() {
  const backgroundColor = useThemeColor({}, "background");

  const editor = useEditorBridge({
    autofocus: true,
    avoidIosKeyboard: true,
    initialContent: "",
    bridgeExtensions: TenTapStartKit,
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <View style={styles.toolbar}>
        <Toolbar editor={editor} items={DEFAULT_TOOLBAR_ITEMS} />
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    minHeight: 44,
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
