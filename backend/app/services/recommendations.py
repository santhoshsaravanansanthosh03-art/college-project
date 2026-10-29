from typing import List, Dict, Any
from ..models.loyalty import RewardRecommendation
from ..db.store import db_store

class RecommendationEngine:
    """
    AI Valuation & Sweet-Spot Optimizer.
    Scans linked balances and dynamic partner redemption charts
    to surface outsized value opportunities (e.g. >2.0¢/point).
    """

    @classmethod
    def get_recommendations(cls) -> List[Dict[str, Any]]:
        conn = db_store.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM accounts")
            accounts = cursor.fetchall()
            expiring = [a for a in accounts if a['is_expiring_soon']]

            recommendations = []

            # 1. Urgent Expiry Recommendation
            for exp in expiring:
                recommendations.append({
                    "id": f"rec-exp-{exp['id']}",
                    "title": f"Redeem Expiring {exp['currency_name']} Before Loss",
                    "partner": exp['program_name'],
                    "category": "dining" if exp['category'] == 'dining' else 'shopping',
                    "requiredPoints": exp['expiring_points'] or 400,
                    "cashEquivalentUsd": round(((exp['expiring_points'] or 400) * 0.05), 2),
                    "valuePerPointCent": 5.0,
                    "description": f"You have {exp['expiring_points']:,} {exp['currency_name']} expiring on {exp['expiration_date']}. Redeem for instant gift cards or merchandise.",
                    "badge": "Urgent Expiry",
                    "sourceProgramName": exp['program_name'],
                    "expirationDate": exp['expiration_date']
                })

            # 2. Premium Airline Business Class Sweet Spot
            delta_acc = next((a for a in accounts if 'delta' in a['program_id']), None)
            if delta_acc and delta_acc['points_balance'] >= 75000:
                recommendations.append({
                    "id": "rec-delta-one",
                    "title": "Business Class Flight to Tokyo (HND)",
                    "partner": "Delta SkyMiles",
                    "category": "travel",
                    "requiredPoints": 85000,
                    "cashEquivalentUsd": 2850.00,
                    "valuePerPointCent": 3.35,
                    "description": "Redeem Delta One Suite on non-stop flagship A350. Top redemption value (over 3.3¢/mile vs baseline 1.2¢).",
                    "badge": "Exceptional Value",
                    "sourceProgramName": "Delta SkyMiles"
                })

            # 3. Luxury Hotel Sweet Spot
            marriott_acc = next((a for a in accounts if 'marriott' in a['program_id']), None)
            if marriott_acc and marriott_acc['points_balance'] >= 100000:
                recommendations.append({
                    "id": "rec-ritz-maui",
                    "title": "5 Nights at The Ritz-Carlton Maui",
                    "partner": "Marriott Bonvoy",
                    "category": "hotel",
                    "requiredPoints": 160000,
                    "cashEquivalentUsd": 2150.00,
                    "valuePerPointCent": 1.34,
                    "description": "Take advantage of Stay for 5, Pay for 4 award night perk. Save over $2,100 on oceanfront luxury.",
                    "badge": "5th Night Free",
                    "sourceProgramName": "Marriott Bonvoy"
                })

            # 4. Transfer Bonus Alert
            cursor.execute("SELECT * FROM transfer_partners WHERE bonus_percentage > 0")
            bonus_partners = cursor.fetchall()
            for bp in bonus_partners:
                recommendations.append({
                    "id": f"rec-promo-{bp['id']}",
                    "title": f"+{int(bp['bonus_percentage'])}% Transfer Bonus Active",
                    "partner": bp['target_program_name'],
                    "category": "travel",
                    "requiredPoints": 10000,
                    "cashEquivalentUsd": 220.00,
                    "valuePerPointCent": 2.2,
                    "description": f"Convert {bp['source_program_name']} to {bp['target_program_name']} and receive an extra {int(bp['bonus_percentage'])}% points until {bp['bonus_expires_at']}.",
                    "badge": f"+{int(bp['bonus_percentage'])}% Bonus",
                    "sourceProgramName": bp['source_program_name']
                })

            return recommendations
        finally:
            conn.close()

recommendation_engine = RecommendationEngine()
