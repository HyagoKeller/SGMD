#!/usr/bin/env python3
"""
SGMD Backend API Testing Suite
Tests all endpoints for the Brazilian Government Change Management Calendar
"""

import requests
import sys
import json
from datetime import datetime, timedelta

class SGMDAPITester:
    def __init__(self, base_url="https://calendario-sgmd.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            details = f"Expected {expected_status}, got {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f" - {error_data.get('detail', 'No error details')}"
                except:
                    details += f" - {response.text[:100]}"
            
            self.log_test(name, success, details if not success else "")
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_auth_flow(self):
        """Test complete authentication flow"""
        print("\n🔐 Testing Authentication Flow...")
        
        # Test login with correct credentials
        success, response = self.run_test(
            "Login with admin credentials",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@sgmd.gov.br", "password": "admin123"}
        )
        
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token[:20]}...")
        else:
            print("   ❌ Failed to get token, stopping auth tests")
            return False

        # Test /auth/me endpoint
        self.run_test(
            "Get current user info",
            "GET",
            "auth/me",
            200
        )

        # Test login with wrong credentials
        self.run_test(
            "Login with wrong password",
            "POST",
            "auth/login",
            401,
            data={"email": "admin@sgmd.gov.br", "password": "wrongpass"}
        )

        # Test logout
        self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )

        return True

    def test_changes_crud(self):
        """Test complete CRUD operations for changes"""
        print("\n📋 Testing Changes CRUD Operations...")
        
        if not self.token:
            print("   ❌ No token available, skipping CRUD tests")
            return False

        # Test GET all changes
        success, changes_data = self.run_test(
            "Get all changes",
            "GET",
            "changes",
            200
        )

        initial_count = len(changes_data) if success else 0
        print(f"   Initial changes count: {initial_count}")

        # Test CREATE change with all ITIL fields
        today = datetime.now().strftime('%Y-%m-%d')
        tomorrow = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        test_change = {
            "titulo": "Teste Mudanca API",
            "descricao": "Mudanca criada via teste automatizado",
            "responsavel": "Teste Automatizado",
            "sistema_afetado": "Sistema de Testes",
            "data_inicio": today,
            "data_fim": tomorrow,
            "status": "planejada",
            "impacto": "medio",
            # ITIL fields
            "tipo_mudanca": "sistemas",
            "categoria_itil": "normal",
            "prioridade": "media",
            "risco": "medio",
            "numero_rfc": "RFC-2026-TEST-001",
            "justificativa": "Teste automatizado do sistema",
            "plano_rollback": "Reverter alteracoes via backup",
            "janela_manutencao": "Sabado 22h - Domingo 06h",
            "aprovador": "CAB Teste",
            "servicos_impactados": "Sistema de testes, API"
        }

        success, created_change = self.run_test(
            "Create new change with ITIL fields",
            "POST",
            "changes",
            201,
            data=test_change
        )

        if not success or not created_change.get('id'):
            print("   ❌ Failed to create change, skipping remaining CRUD tests")
            return False

        change_id = created_change['id']
        print(f"   Created change ID: {change_id}")

        # Test GET changes again to verify creation
        success, updated_changes = self.run_test(
            "Get changes after creation",
            "GET",
            "changes",
            200
        )

        if success:
            new_count = len(updated_changes)
            if new_count == initial_count + 1:
                self.log_test("Change count increased correctly", True)
            else:
                self.log_test("Change count incorrect", False, f"Expected {initial_count + 1}, got {new_count}")

        # Test UPDATE change
        update_data = {
            "titulo": "Teste Mudanca API - ATUALIZADA",
            "status": "aprovada",
            "prioridade": "alta",
            "risco": "alto"
        }

        success, updated_change = self.run_test(
            "Update change",
            "PUT",
            f"changes/{change_id}",
            200,
            data=update_data
        )

        if success:
            if updated_change.get('titulo') == update_data['titulo']:
                self.log_test("Change title updated correctly", True)
            else:
                self.log_test("Change title not updated", False)

        # Test DELETE change
        success, _ = self.run_test(
            "Delete change",
            "DELETE",
            f"changes/{change_id}",
            200
        )

        # Verify deletion
        success, final_changes = self.run_test(
            "Get changes after deletion",
            "GET",
            "changes",
            200
        )

        if success:
            final_count = len(final_changes)
            if final_count == initial_count:
                self.log_test("Change deleted correctly", True)
            else:
                self.log_test("Change not deleted", False, f"Expected {initial_count}, got {final_count}")

        return True

    def test_csv_export(self):
        """Test CSV export functionality"""
        print("\n📊 Testing CSV Export...")
        
        if not self.token:
            print("   ❌ No token available, skipping CSV export test")
            return False

        try:
            url = f"{self.base_url}/changes/export/csv"
            headers = {'Authorization': f'Bearer {self.token}'}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'csv' in content_type.lower() or 'text' in content_type.lower():
                    self.log_test("CSV export successful", True)
                    print(f"   CSV content length: {len(response.content)} bytes")
                else:
                    self.log_test("CSV export wrong content type", False, f"Got {content_type}")
            else:
                self.log_test("CSV export failed", False, f"Status {response.status_code}")
                
        except Exception as e:
            self.log_test("CSV export exception", False, str(e))

    def test_new_features(self):
        """Test new features: no emergencial status, resultado_conclusao field"""
        print("\n🆕 Testing New Features...")
        
        if not self.token:
            print("   ❌ No token available, skipping new features tests")
            return False

        # Test creating change with 'concluida' status and resultado_conclusao
        today = datetime.now().strftime('%Y-%m-%d')
        
        test_change_concluida = {
            "titulo": "Teste Mudanca Concluida",
            "descricao": "Mudanca concluida para teste",
            "data_inicio": today,
            "status": "concluida",
            "tipo_mudanca": "infraestrutura",
            "resultado_conclusao": "sucesso"
        }

        success, created_change = self.run_test(
            "Create change with status 'concluida' and resultado_conclusao",
            "POST",
            "changes",
            201,
            data=test_change_concluida
        )

        if success and created_change.get('id'):
            change_id = created_change['id']
            
            # Verify the resultado_conclusao field is saved
            if created_change.get('resultado_conclusao') == 'sucesso':
                self.log_test("resultado_conclusao field saved correctly", True)
            else:
                self.log_test("resultado_conclusao field not saved", False, f"Expected 'sucesso', got {created_change.get('resultado_conclusao')}")
            
            # Test updating resultado_conclusao
            update_data = {"resultado_conclusao": "sucesso_ressalvas"}
            success, updated_change = self.run_test(
                "Update resultado_conclusao field",
                "PUT",
                f"changes/{change_id}",
                200,
                data=update_data
            )
            
            if success and updated_change.get('resultado_conclusao') == 'sucesso_ressalvas':
                self.log_test("resultado_conclusao field updated correctly", True)
            else:
                self.log_test("resultado_conclusao field not updated", False)
            
            # Clean up
            self.run_test(
                "Delete test change",
                "DELETE",
                f"changes/{change_id}",
                200
            )

        # Test that 'emergencial' status is rejected (should not exist)
        test_change_emergencial = {
            "titulo": "Teste Emergencial",
            "data_inicio": today,
            "status": "emergencial"  # This should not be allowed
        }

        # This should either fail validation or be accepted but converted to a valid status
        success, response = self.run_test(
            "Try to create change with 'emergencial' status",
            "POST",
            "changes",
            201,  # We expect it to succeed but not use emergencial
            data=test_change_emergencial
        )

        if success:
            # Check if the status was changed to something valid
            actual_status = response.get('status')
            if actual_status != 'emergencial':
                self.log_test("emergencial status correctly rejected/converted", True, f"Status became: {actual_status}")
                # Clean up
                if response.get('id'):
                    self.run_test("Delete emergencial test change", "DELETE", f"changes/{response['id']}", 200)
            else:
                self.log_test("emergencial status incorrectly accepted", False, "emergencial status should not exist")

    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n🚨 Testing Error Handling...")
        
        # Test unauthorized access
        old_token = self.token
        self.token = None
        
        self.run_test(
            "Unauthorized access to changes",
            "GET",
            "changes",
            401
        )
        
        # Test invalid change ID
        self.token = old_token
        self.run_test(
            "Get non-existent change",
            "PUT",
            "changes/invalid-id",
            404,
            data={"titulo": "test"}
        )

        # Test invalid data
        self.run_test(
            "Create change with missing required field",
            "POST",
            "changes",
            422,
            data={"descricao": "Missing titulo"}
        )

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting SGMD Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        auth_success = self.test_auth_flow()
        
        if auth_success:
            self.test_changes_crud()
            self.test_new_features()  # Test new features
            self.test_csv_export()
            self.test_error_handling()
        else:
            print("❌ Authentication failed, skipping other tests")
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("❌ Some tests failed!")
            print("\nFailed tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['details']}")
            return 1

def main():
    tester = SGMDAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())