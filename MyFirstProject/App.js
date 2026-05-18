import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Header Logo */}
        <View style={styles.header}>
          <Ionicons name="school-outline" size={24} color="#A34905" />
          <Text style={styles.headerTitle}>FPT University</Text>
        </View>

        {/* Center Welcome Icon */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="school" size={40} color="#A34905" />
          </View>
          <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
          <Text style={styles.welcomeSub}>Đăng nhập để tiếp tục hành trình học tập của bạn.</Text>
        </View>

        {/* Login Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Sinh viên</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666" />
              <TextInput 
                style={styles.input} 
                placeholder="student@fpt.edu.vn"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#666" />
              <TextInput 
                style={styles.input} 
                placeholder="........"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#666" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity>
            <Text style={styles.forgotPass}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginBtn}>
            <Text style={styles.loginBtnText}>Đăng nhập</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>HOẶC</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleBtn}>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} 
              style={styles.googleIcon} 
            />
            <Text style={styles.googleBtnText}>Đăng nhập bằng Google</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Box */}
        <View style={styles.notiBox}>
          <Ionicons name="megaphone-outline" size={20} color="#A34905" />
          <View style={styles.notiTextContent}>
            <Text style={styles.notiTitle}>Thông báo mới</Text>
            <Text style={styles.notiDesc}>Hệ thống LMS đã được cập nhật phiên bản 2.5. Vui lòng kiểm tra email để biết thêm chi tiết.</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCopyright}>© 2024 FPT University. Academic Innovation Core.</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Privacy Policy</Text>
            <Text style={styles.footerLink}>Terms of Service</Text>
            <Text style={styles.footerLink}>Help Center</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#A34905',
    marginLeft: 8,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  welcomeSub: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFF',
    width: '100%',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
  forgotPass: {
    color: '#A34905',
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
  },
  loginBtn: {
    backgroundColor: '#F27024',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEE',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  googleBtn: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#003366',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleBtnText: {
    color: '#003366',
    fontSize: 14,
    fontWeight: '600',
  },
  notiBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF1E9',
    borderRadius: 12,
    padding: 15,
    marginTop: 25,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#A34905',
  },
  notiTextContent: {
    marginLeft: 12,
    flex: 1,
  },
  notiTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 14,
  },
  notiDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  footerCopyright: {
    fontSize: 11,
    color: '#999',
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 8,
  },
  footerLink: {
    fontSize: 11,
    color: '#666',
    textDecorationLine: 'underline',
    marginHorizontal: 10,
  },
});